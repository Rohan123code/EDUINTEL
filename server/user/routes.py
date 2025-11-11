from fastapi import APIRouter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os
from perplexity import Perplexity
import json
from core.db import SessionLocal, PDF
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/user", tags=["User"])

VECTOR_PATH = "vectorstore/"
MAPPING_PATH = "vectorstore/mapping.json"


# ❗ FIX #1 — use the api_key argument instead of re-reading env again
def ask_perplexity(question, api_key):
    print("quesitiomnnn",question)
    client = Perplexity(api_key=api_key)

    completion = client.chat.completions.create(
        model="sonar-pro",
        messages=[
            {"role": "user", "content": question}
        ]
    )

    return completion.choices[0].message.content



@router.post("/ask")
async def ask_user_question(query: str):
    print("🔑 Perplexity Key:", os.getenv("PERPLEXITY_API_KEY"))

    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        return {"status": "error", "message": "PERPLEXITY_API_KEY not found in environment"}

    # --------------------------
    # Load Embedder
    # --------------------------
    embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    # --------------------------
    # Load FAISS
    # --------------------------
    try:
        vector_store = FAISS.load_local(
            VECTOR_PATH,
            embedder,
            allow_dangerous_deserialization=True
        )
    except Exception:
        return {"status": "error", "message": "Vector store not found"}

    # --------------------------
    # Search similar chunks
    # --------------------------
    docs = vector_store.similarity_search(query, k=5)

    if len(docs) == 0:
        return {"status": "error", "message": "No relevant documents found"}

    # --------------------------
    # Load mapping.json
    # --------------------------
    with open(MAPPING_PATH, "r") as f:
        mapping = json.load(f)

    matched_chunks = []
    print("mapping", mapping)
    # --------------------------
    # Match chunks → PDF source
    # --------------------------
    db = SessionLocal()
    try:
        for d in docs:
            # ✔ FIX — doc_id must exist in embeddings
            print(d.metadata, "id")
            if "doc_id" not in d.metadata:
                continue
            print("helloo")
            vector_id = int(d.metadata["doc_id"])

            # find matching PDF
            pdf_info = None
            for _, meta in mapping.items():
                if meta["start"] <= vector_id <= meta["end"]:
                    pdf_info = meta
                    break

            if not pdf_info:
                continue

            # fetch mysql metadata
            pdf_entry = db.query(PDF).filter(PDF.filename == pdf_info["pdf_name"]).first()
            if not pdf_entry:
                continue

            matched_chunks.append({
                "chunk": d.page_content,
                "pdf_name": pdf_entry.filename,
                "cloud_url": pdf_entry.cloud_url,
                "cloud_id": pdf_entry.cloud_id,
                "vector_id": vector_id
            })

    finally:
        db.close()

    # --------------------------
    # Build final RAG prompt
    # --------------------------
    context_text = "\n\n".join([c["chunk"] for c in matched_chunks])
    final_prompt = f"Context:\n{context_text}\n\nQuestion: {query}"

    # --------------------------
    # Ask Perplexity LLM
    # --------------------------
    answer = ask_perplexity(final_prompt, api_key)

    return {
        "status": "success",
        "query": query,
        "answer": answer,
        "results": matched_chunks
    }
