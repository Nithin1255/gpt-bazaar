from pathlib import Path
from typing import Any

from app.services.supabase_client import get_db_connection

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


def run_migrations(conn_override: Any = None) -> list[str]:
    """Apply pending *.sql files in app/migrations/ inside transactions and return newly applied versions."""
    if not MIGRATIONS_DIR.is_dir():
        return []

    sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not sql_files:
        return []

    applied_now: list[str] = []

    def _apply(conn: Any) -> None:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version TEXT PRIMARY KEY,
                    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            cur.execute("SELECT version FROM schema_migrations")
            rows = cur.fetchall()
            already_applied = {
                row["version"] if isinstance(row, dict) else row[0] for row in rows
            }
        conn.commit()

        for sql_file in sql_files:
            version = sql_file.name
            if version in already_applied:
                continue
            sql_text = sql_file.read_text(encoding="utf-8")
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute(sql_text)
                    cur.execute(
                        "INSERT INTO schema_migrations (version) VALUES (%s)",
                        (version,),
                    )
            applied_now.append(version)

    if conn_override is not None:
        _apply(conn_override)
    else:
        with get_db_connection() as conn:
            _apply(conn)

    return applied_now
