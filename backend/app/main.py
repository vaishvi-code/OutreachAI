from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import professor, industry, history
from app.database import init_db

app = FastAPI(title="OutreachAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(professor.router, prefix="/professor", tags=["Professor Outreach"])
app.include_router(industry.router, prefix="/industry", tags=["Industry Outreach"])
app.include_router(history.router, prefix="/history", tags=["History"])

@app.get("/")
def root():
    return {"message": "OutreachAI API is running"}
