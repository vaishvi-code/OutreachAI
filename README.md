# OutreachAI 🚀

AI-powered cold email engine for professors and industry contacts.

**Stack:** FastAPI · SQLite · React · Claude AI · Hunter.io · Railway · Vercel

---

## Features

- 🎓 **Professor Outreach** — Enter a professor's research interests, get a personalized email in seconds
- 🏢 **Industry Outreach** — Enter a company domain, Hunter.io finds real contacts, Claude drafts your cold email
- 📋 **History** — All generated emails saved locally, track what you've sent

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
uvicorn app.main:app --reload
```

API runs at: http://localhost:8000  
Docs at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
# Set VITE_API_URL=http://localhost:8000 in .env.local
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Deploy (Free Tier)

### Backend → Railway

1. Push repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the `backend/` folder
4. Add environment variables:
   - `ANTHROPIC_API_KEY` = your key
   - `HUNTER_API_KEY` = your key
5. Railway auto-detects the Procfile and deploys

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Set root directory to `frontend/`
3. Add environment variable: `VITE_API_URL` = your Railway backend URL
4. Deploy!

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/professor/generate-email` | Generate professor outreach email |
| POST | `/industry/generate-email` | Find contacts + generate industry email |
| GET | `/history/` | Get all outreach history |
| PATCH | `/history/{id}/status` | Update email status |
| DELETE | `/history/{id}` | Delete a record |

---

## Environment Variables

```
ANTHROPIC_API_KEY=your_anthropic_key
HUNTER_API_KEY=your_hunter_key
DB_PATH=outreachai.db
```
