import json
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from psycopg import Connection

from api.db.types.register import register_types
from api.utils import get_env_variable, get_secret


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    global conn
    conn = Connection.connect(
        dbname=get_env_variable("DB_NAME"),
        user=get_env_variable("DB_USER"),
        password=get_secret("DB_PASSWORD"),
        host=get_env_variable("DB_HOST"),
    )
    register_types(conn)
    print("Initialised db connection")
    openapi_json_file = get_env_variable("OPENAPI_JSON_PATH")
    if openapi_json_file is not None:
        openapi = get_openapi(
            title="Pub Crawl Tracker", version="1.0.0", routes=app.routes
        )
        with open(openapi_json_file, "w") as f:
            json.dump(openapi, f)
    yield
    print("Shutting down db connectionn")
    conn.close()


def get_db_connection() -> Connection:
    return conn
