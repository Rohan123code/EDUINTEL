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

VECTOR_PATH = "vectorstore/"
MAPPING_PATH = "vectorstore/mapping.json"
async def process_pdf(file: UploadFile):
    from sqlalchemy.orm import Session

    # --------------------------
    # Duplicate Check (MySQL)
    # --------------------------
    db: Session = SessionLocal()
    existing = db.query(PDF).filter(PDF.filename == file.filename).first()
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

    print("🔄 Creating embeddings for chunks...")

    # --------------------------
    # Load existing FAISS or create new
    # --------------------------
    try:
        faiss_store_old = FAISS.load_local(
            VECTOR_PATH,
            embedder,
            allow_dangerous_deserialization=True
        )
        start_id = len(faiss_store_old.index_to_docstore_id)
        print("📥 Existing FAISS found. Appending…")

    except Exception:
        print("📦 No FAISS found — creating new store.")
        faiss_store_old = None
        start_id = 0

    # --------------------------
    # ADD METADATA TO EACH CHUNK
    # --------------------------
    metadatas = [
        {"doc_id": start_id + i, "pdf_name": file.filename, "cloud_id": cloud_id}
        for i in range(len(chunks))
    ]

    # Create new FAISS index WITH metadata
    faiss_store_new = FAISS.from_texts(
        chunks,
        embedder,
        metadatas=metadatas
    )

    # Merge if FAISS exists
    if faiss_store_old:
        faiss_store_old.merge_from(faiss_store_new)
        faiss_store_old.save_local(VECTOR_PATH)
    else:
        faiss_store_new.save_local(VECTOR_PATH)

    # IDs range for this PDF
    total_vectors = len(chunks)
    end_id = start_id + total_vectors

    # --------------------------
    # Update Mapping JSON
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
        "cloud_id": cloud_id
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
        "vectors": total_vectors
    }
