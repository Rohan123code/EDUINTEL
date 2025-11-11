from fastapi import FastAPI
from admin.routes import router as admin_router
from user.routes import router as user_router
from core.db import init_db
from dotenv import load_dotenv
load_dotenv()


app = FastAPI(title="Admin RAG API")

init_db()

app.include_router(admin_router)
app.include_router(user_router)


@app.get("/")
def home():
    return {"message": "Admin API Running"}
