import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database.database import Base, engine
from backend.app.database import models
from backend.app.api.expense_api import router
from dotenv import load_dotenv

load_dotenv()

origins = os.getenv("BACKEND_CORS_ORIGINS")

Base.metadata.create_all(
    bind=engine
)

app = FastAPI(
    title="AI Expense Tracker API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "AI Expense Tracker API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }
