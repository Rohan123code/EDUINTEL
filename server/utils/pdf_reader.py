
from PyPDF2 import PdfReader

def extract_text(path):
    text = ""
    pdf_reader = PdfReader(path)
    for page in pdf_reader.pages:
        text += page.extract_text()
    print("\n🤔 pdf read success!!" )

    return text
