from fastapi import APIRouter
from app.database import get_db

router = APIRouter()

@router.get("/")
def get_history():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM outreach_history ORDER BY created_at DESC LIMIT 50"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.patch("/{id}/status")
def update_status(id: int, status: str):
    conn = get_db()
    conn.execute("UPDATE outreach_history SET status = ? WHERE id = ?", (status, id))
    conn.commit()
    conn.close()
    return {"message": "Status updated"}

@router.delete("/{id}")
def delete_record(id: int):
    conn = get_db()
    conn.execute("DELETE FROM outreach_history WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}
