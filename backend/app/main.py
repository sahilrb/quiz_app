from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import quiz, admin
from .database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Quiz Application")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router)
app.include_router(admin.router)

@app.get("/")
def health():
    return {"status": "ok"}