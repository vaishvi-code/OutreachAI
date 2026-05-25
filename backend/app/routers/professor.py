from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

VAISHVI_BIO = """
Name: Vaishvi Himanshubhai Patel
Degree: Master of Computer Science (1st year), North Carolina State University, graduating May 2027
GPA: 3.9/4.0
Current Role: Teaching Assistant at NCSU
Experience: Software Engineering Intern at Cignex Technologies (AWS Rekognition, computer vision, 85% accuracy),
AI Intern at IBM SkillsBuild (Watson, NLP, Flask, 88% user satisfaction).
Key Skills: Python, FastAPI, React, PyTorch, TensorFlow, AWS, Docker, NLP, Computer Vision, Deep Learning.
Projects: FoodPool (full-stack group ordering app), Mood Muze (emotion-aware music recommendation), BERT-based multi-label emotion classifier.
"""

class ProfessorRequest(BaseModel):
    professor_name: str
    university: str = "NC State University"
    department: str = ""
    professor_url: str = ""

class EmailResponse(BaseModel):
    subject: str
    body: str
    recipient_name: str
    recipient_email: str
    scraped_info: dict

@router.post("/generate-email", response_model=EmailResponse)
async def generate_professor_email(req: ProfessorRequest):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash")

    # Optionally fetch faculty page to give Gemini more context
    page_text = ""
    if req.professor_url:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(req.professor_url, headers={"User-Agent": "Mozilla/5.0"})
                page_text = resp.text[:4000]
        except:
            page_text = ""

    # Single prompt — research + email generation in one call
    prompt = f"""You are helping a graduate student write a personalized cold email to a professor for research/RA opportunities.

Student Info:
{VAISHVI_BIO}

Professor Info:
- Name: {req.professor_name}
- Department: {req.department if req.department else "unknown"}
- University: {req.university}
- Faculty Page URL: {req.professor_url if req.professor_url else "not provided"}
- Faculty Page Content (if available): {page_text if page_text else "not available"}

Instructions:
1. Use your knowledge OR the faculty page content to identify this professor's research areas and one notable work/paper/lab.
2. Write a 150-200 word personalized cold email from Vaishvi to this professor.

Email rules:
- Reference their specific research naturally — no generic phrases
- Mention 1-2 of Vaishvi's skills or projects that align with the professor's work
- Professional but warm tone
- Never start with "I am writing to express my interest"
- End with a specific ask (15-min call or to discuss further)

Respond ONLY as a JSON object with no markdown, no code fences, no extra text:
{{"research_areas": "2-3 sentence summary of their research", "notable_work": "one specific paper or project if known, else empty string", "professor_email": "their email if found in page content, else empty string", "subject": "email subject line", "body": "full email body"}}"""

    response = model.generate_content(prompt)
    text = response.text.strip()
    text = text.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned malformed response. Please try again.")

    # Save to history
    from app.database import get_db
    conn = get_db()
    conn.execute(
        "INSERT INTO outreach_history (type, recipient_name, recipient_email, subject, email_body) VALUES (?, ?, ?, ?, ?)",
        ("professor", req.professor_name, data.get("professor_email", ""), data["subject"], data["body"])
    )
    conn.commit()
    conn.close()

    return EmailResponse(
        subject=data["subject"],
        body=data["body"],
        recipient_name=req.professor_name,
        recipient_email=data.get("professor_email", ""),
        scraped_info={
            "research_areas": data.get("research_areas", ""),
            "notable_work": data.get("notable_work", ""),
        }
    )