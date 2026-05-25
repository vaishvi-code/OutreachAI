from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import httpx
import os
import json

router = APIRouter()

HUNTER_API_KEY = os.getenv("HUNTER_API_KEY", "7ac59ee42947d70a2c46127647ef118f52ab018c")

VAISHVI_BIO = """
Name: Vaishvi Himanshubhai Patel
Degree: Master of Computer Science (1st year), North Carolina State University, graduating May 2027
GPA: 3.9/4.0
Current Role: Teaching Assistant at NCSU
Background: AI/ML engineer and full-stack developer with hands-on industry experience.
Experience: Software Engineering Intern at Cignex Technologies (AWS, computer vision), AI Intern at IBM SkillsBuild (Watson, NLP, Flask).
Key Skills: Python, FastAPI, React, PyTorch, TensorFlow, AWS, Docker, NLP, Computer Vision, Deep Learning.
Projects: FoodPool (full-stack), Mood Muze (emotion AI), BERT emotion classifier.
"""

class IndustryRequest(BaseModel):
    company_domain: str
    company_name: str
    role_type: str  # "internship" or "full-time"
    department: str = "Data Science / AI"

class ContactResult(BaseModel):
    email: str
    first_name: str
    last_name: str
    position: str

class IndustryEmailResponse(BaseModel):
    contacts: list[ContactResult]
    subject: str
    body: str

@router.post("/generate-email", response_model=IndustryEmailResponse)
async def generate_industry_email(req: IndustryRequest):
    # Step 1: Find contacts via Hunter.io
    async with httpx.AsyncClient() as client:
        hunter_resp = await client.get(
            "https://api.hunter.io/v2/domain-search",
            params={
                "domain": req.company_domain,
                "api_key": HUNTER_API_KEY,
                "limit": 5,
                "department": "executive,it,management"
            }
        )

    contacts = []
    if hunter_resp.status_code == 200:
        data = hunter_resp.json()
        emails = data.get("data", {}).get("emails", [])
        for e in emails[:3]:
            contacts.append(ContactResult(
                email=e.get("value", ""),
                first_name=e.get("first_name", ""),
                last_name=e.get("last_name", ""),
                position=e.get("position", "Unknown")
            ))

    if not contacts:
        contacts = [ContactResult(email=f"careers@{req.company_domain}", first_name="Hiring", last_name="Team", position="Recruiting")]

    # Step 2: Generate email with Claude
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""You are helping a graduate student write a personalized cold outreach email for a {req.role_type} opportunity.

Student Info:
{VAISHVI_BIO}

Target:
- Company: {req.company_name}
- Department: {req.department}
- Role Type: {req.role_type}

Write a compelling, concise cold email from Vaishvi to this company's {req.department} team.

Rules:
- 150-200 words max
- Mention the company naturally (not generic)
- Highlight 1-2 specific technical skills relevant to {req.department}
- Reference a relevant project briefly
- Professional, confident, not desperate
- Clear ask at the end ({req.role_type} opportunity or informational chat)

Respond ONLY in this JSON format (no markdown, no extra text):
{{"subject": "email subject here", "body": "full email body here"}}"""

    response = model.generate_content(prompt)
    text = response.text.strip()

    email_data = json.loads(text)

    # Save to history
    from app.database import get_db
    conn = get_db()
    conn.execute(
        "INSERT INTO outreach_history (type, recipient_name, recipient_email, subject, email_body) VALUES (?, ?, ?, ?, ?)",
        ("industry", req.company_name, contacts[0].email if contacts else "", email_data["subject"], email_data["body"])
    )
    conn.commit()
    conn.close()

    return IndustryEmailResponse(
        contacts=contacts,
        subject=email_data["subject"],
        body=email_data["body"]
    )
