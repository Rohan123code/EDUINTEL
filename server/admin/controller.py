import faiss
import json
import numpy as np
from fastapi import UploadFile
from core.embedding import get_embedding
from core.cloudinary_client import upload_pdf
from utils.pdf_reader import extract_text
from utils.clean import clean_text
from utils.chunk import chunk_text
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from core.db import SessionLocal, PDF
import os
import shutil
from sqlalchemy.orm import Session

VECTOR_PATH = "vectorstore/"
MAPPING_PATH = "vectorstore/mapping.json"
async def process_pdf(file: UploadFile, pdf_title: str, pdf_description: str, uploaded_by: int):
  

    # --------------------------
    # Duplicate Check (MySQL)
    # --------------------------
    
    db: Session = SessionLocal()
    existing = db.query(PDF).filter(PDF.filename == file.filename).first()
    print("exispt",existing)
    if existing:
        return {"status": "error", "message": "PDF already uploaded!"}

    # --------------------------
    # Save temporary
    # --------------------------
    UPLOAD_DIR = "uploads"

    if os.path.isfile(UPLOAD_DIR):
        os.remove(UPLOAD_DIR)

    if not os.path.isdir(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    file_path = f"{UPLOAD_DIR}/{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # --------------------------
    # Upload to Cloudinary
    # --------------------------
    cloud_data = upload_pdf(file_path)
    cloud_url = cloud_data["cloud_url"]
    cloud_id = cloud_data["cloud_id"]

    # --------------------------
    # Extract & Chunk PDF Text
    # --------------------------
    raw = extract_text(file_path)
    cleaned = clean_text(raw)
    chunks = chunk_text(raw)

    # --------------------------
    # Embedding & FAISS
    # --------------------------
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    embedder = HuggingFaceEmbeddings(model_name=model_name)

    try:
        faiss_store_old = FAISS.load_local(
            VECTOR_PATH,
            embedder,
            allow_dangerous_deserialization=True
        )
        start_id = len(faiss_store_old.index_to_docstore_id)
    except Exception:
        faiss_store_old = None
        start_id = 0

    # Metadata per chunk
    metadatas = [
        {
            "doc_id": start_id + i,
            "pdf_name": file.filename,
            "cloud_id": cloud_id,
            "pdf_title": pdf_title,
            "pdf_description": pdf_description,
            "uploaded_by": uploaded_by
        }
        for i in range(len(chunks))
    ]

    faiss_store_new = FAISS.from_texts(chunks, embedder, metadatas=metadatas)

    if faiss_store_old:
        faiss_store_old.merge_from(faiss_store_new)
        faiss_store_old.save_local(VECTOR_PATH)
    else:
        faiss_store_new.save_local(VECTOR_PATH)

    total_vectors = len(chunks)
    end_id = start_id + total_vectors

    # --------------------------
    # Update mapping.json
    # --------------------------
    try:
        with open(MAPPING_PATH, "r") as f:
            mapping = json.load(f)
    except:
        mapping = {}

    mapping[file.filename] = {
        "start": start_id,
        "end": end_id,
        "pdf_name": file.filename,
        "cloud_url": cloud_url,
        "cloud_id": cloud_id,
        "pdf_title": pdf_title,
        "pdf_description": pdf_description,
        "uploaded_by": uploaded_by
    }

    with open(MAPPING_PATH, "w") as f:
        json.dump(mapping, f, indent=4)

    # --------------------------
    # Save in MySQL
    # --------------------------
    pdf_entry = PDF(
        filename=file.filename,
        cloud_url=cloud_url,
        cloud_id=cloud_id,
        pdf_description=pdf_description,
        pdf_title=pdf_title,
        uploaded_by=uploaded_by,
        vector_count=total_vectors
    )

    db.add(pdf_entry)
    db.commit()
    db.refresh(pdf_entry)

    return {
        "status": "success",
        "pdf_id": pdf_entry.id,
        "filename": file.filename,
        "cloud_url": cloud_url,
        "cloud_id": cloud_id,
        "title": pdf_title,
        "description": pdf_description,
        "uploaded_by": uploaded_by,
        "vectors": total_vectors
    }
