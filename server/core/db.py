from sqlalchemy import create_engine, Column, Integer, String , Text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
load_dotenv()

DB_URL = f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}@" \
         f"{os.getenv('MYSQL_HOST')}/{os.getenv('MYSQL_DB')}"

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class PDF(Base):
    __tablename__ = "pdfs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    cloud_url = Column(String(255))
    cloud_id = Column(String, nullable=False)
    pdf_title = Column(String(255), nullable=False)
    pdf_description = Column(Text, nullable=False) 
    uploaded_by = Column(String(255), nullable=False)
    vector_count = Column(Integer)


def init_db():
    Base.metadata.create_all(bind=engine)
