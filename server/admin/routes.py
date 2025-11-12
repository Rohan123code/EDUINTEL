from fastapi import APIRouter, UploadFile, File,Form
from .controller import process_pdf

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    pdf_title: str = Form(...),
    pdf_description: str = Form(...),
    uploaded_by: str = Form(...)
):
    return await process_pdf(file, pdf_title, pdf_description, uploaded_by)

# @router.post("/upload")
# async def test_upload(
#     file: UploadFile = File(None),
#     pdf_title: str = Form(None),
#     pdf_description: str = Form(None),
#     uploaded_by: str = Form(None)
# ):
#     return {
#         "file": file.filename if file else None,
#         "title": pdf_title,
#         "description": pdf_description,
#         "uploaded_by": uploaded_by
#     }
