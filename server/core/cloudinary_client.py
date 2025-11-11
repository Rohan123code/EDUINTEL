import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET")
)

def upload_pdf(path):
    print("cloud uploading !!!")

    response = cloudinary.uploader.upload(
        path,
        resource_type="raw",
        folder="rag_pdfs"
    )

    print(response)
    print("cloud uploaded !!!")

    # Return both URL + public_id
    return {
        "cloud_id": response["public_id"],
        "cloud_url": response["secure_url"]
    }
