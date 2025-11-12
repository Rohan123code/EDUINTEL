from fastapi import FastAPI
from admin.routes import router as admin_router
from user.routes import router as user_router
from core.db import init_db
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()


app = FastAPI(title="Admin RAG API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


init_db()

app.include_router(admin_router)
app.include_router(user_router)


@app.get("/")
def home():
    return {"message": "Admin API Running"}
