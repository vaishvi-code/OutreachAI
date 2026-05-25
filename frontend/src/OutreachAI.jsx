import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0f; color: #e8e4dc; font-family: 'DM Mono', monospace; min-height: 100vh; }
  .app { min-height: 100vh; background: #0a0a0f; position: relative; overflow: hidden; }
  .bg-grid { position: fixed; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0; }
  .bg-glow { position: fixed; width: 600px; height: 600px; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; opacity: 0.15; }
  .glow-1 { background: #6c63ff; top: -200px; left: -200px; }
  .glow-2 { background: #ff6b6b; bottom: -200px; right: -200px; }
  .header { position: relative; z-index: 10; padding: 28px 40px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; backdrop-filter: blur(10px); background: rgba(10,10,15,0.8); }
  .logo { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; }
  .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #6c63ff; box-shadow: 0 0 12px #6c63ff; animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 12px #6c63ff; } 50% { opacity: 0.6; box-shadow: 0 0 4px #6c63ff; } }
  .tagline { font-size: 11px; color: rgba(232,228,220,0.4); letter-spacing: 2px; text-transform: uppercase; }
  .main { position: relative; z-index: 10; max-width: 900px; margin: 0 auto; padding: 40px 24px; }
  .hero { text-align: center; margin-bottom: 48px; }
  .hero h1 { font-family: 'Syne', sans-serif; font-size: clamp(36px, 6vw, 56px); font-weight: 800; line-height: 1.05; letter-spacing: -2px; margin-bottom: 16px; }
  .hero h1 span { color: #6c63ff; }
  .hero p { color: rgba(232,228,220,0.5); font-size: 14px; letter-spacing: 0.5px; }
  .tabs { display: flex; gap: 2px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 4px; margin-bottom: 32px; }
  .tab { flex: 1; padding: 12px 20px; border: none; border-radius: 9px; cursor: pointer; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; transition: all 0.2s ease; background: transparent; color: rgba(232,228,220,0.4); }
  .tab.active { background: #6c63ff; color: #fff; box-shadow: 0 4px 20px rgba(108,99,255,0.4); }
  .tab:not(.active):hover { color: rgba(232,228,220,0.8); background: rgba(255,255,255,0.04); }
  .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; margin-bottom: 20px; backdrop-filter: blur(10px); }
  .card-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: rgba(232,228,220,0.4); margin-bottom: 20px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(232,228,220,0.4); }
  input, textarea, select { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 14px; color: #e8e4dc; font-family: 'DM Mono', monospace; font-size: 13px; transition: border-color 0.2s; outline: none; width: 100%; }
  input:focus, textarea:focus, select:focus { border-color: #6c63ff; box-shadow: 0 0 0 2px rgba(108,99,255,0.15); }
  textarea { resize: vertical; min-height: 90px; }
  select option { background: #1a1a2e; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; letter-spacing: 0.5px; }
  .btn-primary { background: #6c63ff; color: #fff; width: 100%; margin-top: 20px; box-shadow: 0 4px 20px rgba(108,99,255,0.3); }
  .btn-primary:hover:not(:disabled) { background: #7c73ff; box-shadow: 0 6px 30px rgba(108,99,255,0.5); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-copy { background: rgba(255,255,255,0.06); color: #e8e4dc; border: 1px solid rgba(255,255,255,0.1); font-size: 12px; padding: 8px 16px; }
  .btn-copy:hover { background: rgba(255,255,255,0.1); }
  .result-card { border: 1px solid rgba(108,99,255,0.3); background: rgba(108,99,255,0.05); border-radius: 16px; padding: 28px; margin-top: 24px; animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .result-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
  .result-title { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #6c63ff; }
  .subject-line { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #e8e4dc; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .email-body { font-size: 13px; line-height: 1.8; color: rgba(232,228,220,0.85); white-space: pre-wrap; }
  .scraped-info { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; font-size: 12px; }
  .scraped-info-title { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: rgba(232,228,220,0.3); margin-bottom: 10px; }
  .scraped-row { display: flex; gap: 8px; margin-bottom: 6px; }
  .scraped-label { color: rgba(232,228,220,0.35); min-width: 100px; }
  .scraped-value { color: rgba(232,228,220,0.75); }
  .contacts-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .contact-chip { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 14px; font-size: 12px; }
  .contact-chip .name { font-weight: 500; color: #e8e4dc; }
  .contact-chip .pos { color: rgba(232,228,220,0.4); flex: 1; }
  .contact-chip .email-addr { color: #6c63ff; font-size: 11px; }
  .error { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); border-radius: 8px; padding: 12px 16px; color: #ff6b6b; font-size: 13px; margin-top: 16px; }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .hint { font-size: 11px; color: rgba(232,228,220,0.3); margin-top: 4px; }
  .history-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px 20px; margin-bottom: 10px; display: flex; align-items: center; gap: 14px; }
  .history-badge { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }
  .badge-professor { background: rgba(108,99,255,0.2); color: #6c63ff; }
  .badge-industry { background: rgba(255,107,107,0.2); color: #ff6b6b; }
  .history-info { flex: 1; min-width: 0; }
  .history-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .history-subject { font-size: 12px; color: rgba(232,228,220,0.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .history-date { font-size: 11px; color: rgba(232,228,220,0.3); flex-shrink: 0; }
  .empty-state { text-align: center; padding: 60px 20px; color: rgba(232,228,220,0.3); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .copied { background: rgba(34,197,94,0.2) !important; color: #4ade80 !important; border-color: rgba(34,197,94,0.3) !important; }
  @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .header { padding: 20px; } .main { padding: 24px 16px; } }
`;

function ProfessorTab({ apiBase }) {
  const [form, setForm] = useState({ professor_name: "", university: "NC State University", department: "", professor_url: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.professor_name) { setError("Please enter the professor's name."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${apiBase}/professor/generate-email`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "API error"); }
      setResult(await res.json());
    } catch (e) { setError(e.message || "Could not generate email. Make sure the backend is running."); }
    setLoading(false);
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">🎓 Professor Details</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Professor Name *</label>
            <input placeholder="Dr. Jane Smith" value={form.professor_name} onChange={set("professor_name")} />
          </div>
          <div className="form-group">
            <label>University</label>
            <input value={form.university} onChange={set("university")} />
          </div>
          <div className="form-group">
            <label>Department (optional)</label>
            <input placeholder="Computer Science" value={form.department} onChange={set("department")} />
          </div>
          <div className="form-group">
            <label>Faculty Page URL (optional)</label>
            <input placeholder="https://faculty.ncsu.edu/..." value={form.professor_url} onChange={set("professor_url")} />
            <div className="hint">Paste their profile URL for more accurate personalization</div>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary" onClick={submit} disabled={loading}>
          {loading ? <><div className="spinner" /> Looking up professor & drafting email...</> : "✨ Auto-Research & Generate Email"}
        </button>
      </div>

      {result && (
        <div className="result-card">
          <div className="result-header">
            <div className="result-title">✓ Email Generated for {result.recipient_name}</div>
            <button className={`btn btn-copy ${copied ? "copied" : ""}`} onClick={copy}>{copied ? "✓ Copied!" : "Copy Email"}</button>
          </div>
          {result.scraped_info && (
            <div className="scraped-info">
              <div className="scraped-info-title">Auto-gathered professor info</div>
              {result.scraped_info.research_areas && <div className="scraped-row"><span className="scraped-label">Research:</span><span className="scraped-value">{result.scraped_info.research_areas}</span></div>}
              {result.scraped_info.notable_work && <div className="scraped-row"><span className="scraped-label">Notable work:</span><span className="scraped-value">{result.scraped_info.notable_work}</span></div>}
              {result.recipient_email && <div className="scraped-row"><span className="scraped-label">Email:</span><span className="scraped-value" style={{color:"#6c63ff"}}>{result.recipient_email}</span></div>}
            </div>
          )}
          <div className="subject-line">📌 {result.subject}</div>
          <div className="email-body">{result.body}</div>
        </div>
      )}
    </div>
  );
}

function IndustryTab({ apiBase }) {
  const [form, setForm] = useState({ company_domain: "", company_name: "", role_type: "internship", department: "Data Science / AI" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.company_domain || !form.company_name) { setError("Please enter company name and domain."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${apiBase}/industry/generate-email`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("API error");
      setResult(await res.json());
    } catch (e) { setError("Could not generate email. Make sure the backend is running."); }
    setLoading(false);
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">🏢 Company Details</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Company Name *</label>
            <input placeholder="Google" value={form.company_name} onChange={set("company_name")} />
          </div>
          <div className="form-group">
            <label>Company Domain *</label>
            <input placeholder="google.com" value={form.company_domain} onChange={set("company_domain")} />
          </div>
          <div className="form-group">
            <label>Role Type</label>
            <select value={form.role_type} onChange={set("role_type")}>
              <option value="internship">Internship</option>
              <option value="full-time">Full-time</option>
            </select>
          </div>
          <div className="form-group">
            <label>Target Department</label>
            <input placeholder="Data Science / AI" value={form.department} onChange={set("department")} />
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary" onClick={submit} disabled={loading}>
          {loading ? <><div className="spinner" /> Finding contacts & drafting...</> : "🔍 Find Contacts & Generate Email"}
        </button>
      </div>
      {result && (
        <div className="result-card">
          <div className="result-header">
            <div className="result-title">✓ Contacts Found + Email Ready</div>
            <button className={`btn btn-copy ${copied ? "copied" : ""}`} onClick={copy}>{copied ? "✓ Copied!" : "Copy Email"}</button>
          </div>
          {result.contacts?.length > 0 && (
            <div className="contacts-list">
              {result.contacts.map((c, i) => (
                <div className="contact-chip" key={i}>
                  <span className="name">{c.first_name} {c.last_name}</span>
                  <span className="pos">{c.position}</span>
                  <span className="email-addr">{c.email}</span>
                </div>
              ))}
            </div>
          )}
          <div className="subject-line">📌 {result.subject}</div>
          <div className="email-body">{result.body}</div>
        </div>
      )}
    </div>
  );
}

function HistoryTab({ apiBase }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBase}/history/`).then((r) => r.json()).then(setHistory).catch(() => setHistory([])).finally(() => setLoading(false));
  }, []);

  const formatDate = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div className="empty-state"><div className="spinner" style={{margin:"0 auto"}} /></div>;
  if (!history.length) return <div className="empty-state"><div className="empty-icon">📭</div><div>No outreach history yet.</div></div>;

  return (
    <div>
      {history.map((item) => (
        <div className="history-item" key={item.id}>
          <span className={`history-badge badge-${item.type}`}>{item.type}</span>
          <div className="history-info">
            <div className="history-name">{item.recipient_name}</div>
            <div className="history-subject">{item.subject}</div>
          </div>
          <div className="history-date">{formatDate(item.created_at)}</div>
        </div>
      ))}
    </div>
  );
}

export default function OutreachAI() {
  const [activeTab, setActiveTab] = useState("professor");
  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="bg-grid" />
        <div className="bg-glow glow-1" />
        <div className="bg-glow glow-2" />
        <header className="header">
          <div className="logo"><div className="logo-dot" />OutreachAI</div>
          <div className="tagline">AI-powered cold email engine</div>
        </header>
        <main className="main">
          <div className="hero">
            <h1>Smart outreach.<br /><span>Zero cringe.</span></h1>
            <p>Just enter a name — AI researches the professor and writes the email.</p>
          </div>
          <div className="tabs">
            <button className={`tab ${activeTab === "professor" ? "active" : ""}`} onClick={() => setActiveTab("professor")}>🎓 Professor Outreach</button>
            <button className={`tab ${activeTab === "industry" ? "active" : ""}`} onClick={() => setActiveTab("industry")}>🏢 Industry Outreach</button>
            <button className={`tab ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>📋 History</button>
          </div>
          {activeTab === "professor" && <ProfessorTab apiBase={API_BASE} />}
          {activeTab === "industry" && <IndustryTab apiBase={API_BASE} />}
          {activeTab === "history" && <HistoryTab apiBase={API_BASE} />}
        </main>
      </div>
    </>
  );
}