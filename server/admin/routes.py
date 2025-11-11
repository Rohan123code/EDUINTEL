from fastapi import APIRouter, UploadFile, File
from .controller import process_pdf

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return await process_pdf(file)
