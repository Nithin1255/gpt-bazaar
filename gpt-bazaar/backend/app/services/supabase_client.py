import os
import ssl
from contextlib import contextmanager
from functools import lru_cache
from typing import Any, Iterator
from urllib.parse import parse_qs, unquote, urlparse


class SupabaseConfigurationError(RuntimeError):
    """Raised when Supabase or PostgreSQL credentials are missing or invalid."""


def normalize_database_url(raw_url: str) -> str:
    url = raw_url.strip()
    if not url:
        raise SupabaseConfigurationError(
            "DATABASE_URL is missing. Copy your Supabase PostgreSQL Connection String "
            "(Session Pooler URI) into .env or Render environment variables."
        )
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]

    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if host not in ("localhost", "127.0.0.1") and "sslmode=" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}sslmode=require"
    return url


def get_supabase_settings() -> dict[str, str]:
    db_url = normalize_database_url(os.getenv("DATABASE_URL", ""))
    supabase_url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    bucket = os.getenv("SUPABASE_STORAGE_BUCKET", "catalog-images").strip() or "catalog-images"

    if not supabase_url:
        raise SupabaseConfigurationError(
            "SUPABASE_URL is missing. Set it from Supabase Project Settings -> API."
        )
    if not service_key:
        raise SupabaseConfigurationError(
            "SUPABASE_SERVICE_ROLE_KEY is missing. Set it from Supabase Project Settings -> API."
        )

    return {
        "database_url": db_url,
        "supabase_url": supabase_url,
        "service_role_key": service_key,
        "storage_bucket": bucket,
    }


class _Pg8000Cursor:
    """Adapter around pg8000 DB-API cursor returning dict rows compatible with psycopg dict_row."""

    def __init__(self, raw_cursor: Any) -> None:
        self._cur = raw_cursor

    def __enter__(self) -> "_Pg8000Cursor":
        return self

    def __exit__(self, _exc_type: Any, _exc: Any, _tb: Any) -> None:
        self._cur.close()

    @property
    def rowcount(self) -> int:
        return int(self._cur.rowcount or 0)

    def execute(self, sql: str, params: Any = None) -> "_Pg8000Cursor":
        if params is None:
            self._cur.execute(sql)
        else:
            self._cur.execute(sql, tuple(params))
        return self

    def _to_dict(self, row: Any) -> dict[str, Any]:
        if isinstance(row, dict):
            return row
        cols = [d[0] for d in (self._cur.description or [])]
        return dict(zip(cols, row))

    def fetchone(self) -> Any:
        row = self._cur.fetchone()
        return self._to_dict(row) if row is not None else None

    def fetchall(self) -> list[dict[str, Any]]:
        return [self._to_dict(r) for r in self._cur.fetchall()]


class _Pg8000Connection:
    """Pure-Python pg8000 connection wrapper supporting psycopg-style context & transaction()."""

    def __init__(self, raw_conn: Any) -> None:
        self._conn = raw_conn

    def __enter__(self) -> "_Pg8000Connection":
        return self

    def __exit__(self, exc_type: Any, _exc: Any, _tb: Any) -> None:
        try:
            if exc_type is not None:
                self._conn.rollback()
        finally:
            self._conn.close()

    def cursor(self) -> _Pg8000Cursor:
        return _Pg8000Cursor(self._conn.cursor())

    def commit(self) -> None:
        self._conn.commit()

    def rollback(self) -> None:
        self._conn.rollback()

    @contextmanager
    def transaction(self) -> Iterator["_Pg8000Connection"]:
        try:
            yield self
            self._conn.commit()
        except Exception:
            self._conn.rollback()
            raise


def _build_pg8000_ssl_context(database_url: str, host: str) -> Any:
    query = parse_qs(urlparse(database_url).query)
    sslmode = (query.get("sslmode", [""])[0] or "").lower()
    sslrootcert = query.get("sslrootcert", [""])[0] or None

    if sslmode == "disable" or (not sslmode and host in ("localhost", "127.0.0.1")):
        return None

    ctx = ssl.create_default_context(cafile=sslrootcert)
    if sslmode in ("verify-ca", "verify-full"):
        ctx.check_hostname = sslmode == "verify-full"
        ctx.verify_mode = ssl.CERT_REQUIRED
    else:
        # Match PostgreSQL libpq sslmode=require semantics (TLS encrypted without CA chain failure on poolers)
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
    return ctx


def _connect_pg8000(database_url: str) -> _Pg8000Connection:
    import pg8000.dbapi

    parsed = urlparse(database_url)
    user = unquote(parsed.username or "postgres")
    password = unquote(parsed.password or "")
    host = parsed.hostname or "localhost"
    port = parsed.port or 5432
    database = (parsed.path or "/postgres").lstrip("/") or "postgres"
    ssl_context = _build_pg8000_ssl_context(database_url, host)

    raw_conn = pg8000.dbapi.connect(
        user=user,
        password=password,
        host=host,
        port=port,
        database=database,
        ssl_context=ssl_context,
    )
    return _Pg8000Connection(raw_conn)


def get_db_connection() -> Any:
    settings = get_supabase_settings()
    try:
        import psycopg
        from psycopg.rows import dict_row

        return psycopg.connect(settings["database_url"], row_factory=dict_row)
    except ImportError:
        # Pure-Python fallback when libpq/psycopg_binary DLLs are unavailable or blocked (e.g. Windows App Control)
        return _connect_pg8000(settings["database_url"])


@lru_cache(maxsize=1)
def get_supabase_client() -> Any:
    from supabase import create_client

    settings = get_supabase_settings()
    return create_client(settings["supabase_url"], settings["service_role_key"])


def get_storage_bucket_name() -> str:
    return get_supabase_settings()["storage_bucket"]


def init_supabase() -> dict[str, str]:
    """Validate configuration and verify PostgreSQL + Supabase Storage client on startup."""
    settings = get_supabase_settings()
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            cur.fetchone()
    get_supabase_client()
    return settings
