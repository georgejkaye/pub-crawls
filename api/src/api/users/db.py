import sys
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional

from api.db.functions.all import (
    delete_user,
    insert_user_fetchone,
    select_user_by_email_fetchone,
    select_user_by_user_id_fetchone,
    update_user_fetchone,
)
from api.db.types.all import UserData
from api.utils import get_env_variable, get_secret
from dotenv import load_dotenv
from fastapi_users.db import BaseUserDatabase
from fastapi_users.models import UserProtocol
from psycopg import Connection
from psycopg.rows import TupleRow

db_host = get_env_variable("DB_HOST")
db_name = get_env_variable("DB_NAME")
db_user = get_env_variable("DB_USER")
db_password = get_secret("DB_PASSWORD")

load_dotenv()


@dataclass
class DbConnectionData:
    db_name: Optional[str]
    db_user: Optional[str]
    db_password: Optional[str]
    db_host: Optional[str]


def get_db_connection_data_from_args(
    db_name_index: int = 1,
    db_user_index: int = 2,
    db_password_index: int = 3,
    db_host_index: int = 4,
) -> DbConnectionData:
    if len(sys.argv) > max(
        db_name_index, db_user_index, db_password_index, db_host_index
    ):
        return DbConnectionData(
            sys.argv[db_name_index],
            sys.argv[db_user_index],
            sys.argv[db_password_index],
            sys.argv[db_host_index],
        )
    return DbConnectionData(None, None, None, None)


class DbConnection:
    def __init__(self, data: DbConnectionData):
        self.db_name = data.db_name or get_env_variable("DB_NAME")
        self.db_user = data.db_user or get_env_variable("DB_USER")
        self.db_password = data.db_password or get_secret("DB_PASSWORD")
        self.db_host = data.db_host or get_env_variable("DB_HOST")

    def __enter__(self) -> Connection[TupleRow]:
        self.conn = Connection.connect(
            dbname=self.db_name,
            user=self.db_user,
            password=self.db_password,
            host=self.db_host,
        )
        return self.conn

    def __exit__(self, exc_type: Any, exc_value: Any, traceback: Any) -> None:
        self.conn.close()


def connect(data: DbConnectionData) -> DbConnection:
    return DbConnection(data)


def connect_with_env() -> DbConnection:
    return DbConnection(DbConnectionData(None, None, None, None))


@dataclass
class FastApiUser(UserProtocol[int]):
    id: int
    email: str
    display_name: str
    hashed_password: str
    is_active: bool
    is_superuser: bool
    is_verified: bool
    last_verify_request: Optional[datetime]


def user_to_fast_api_user(user: UserData) -> FastApiUser:
    return FastApiUser(
        user.user_id,
        user.email,
        user.display_name,
        user.hashed_password,
        user.is_active,
        user.is_superuser,
        user.is_verified,
        user.last_verify_request,
    )


def optional_user_to_fast_api_user(
    user: Optional[UserData],
) -> Optional[FastApiUser]:
    return user_to_fast_api_user(user) if user is not None else None


class UserDatabase(BaseUserDatabase[FastApiUser, int]):
    async def get(self, id: int) -> Optional[FastApiUser]:
        with connect_with_env() as conn:
            return optional_user_to_fast_api_user(
                select_user_by_user_id_fetchone(conn, id)
            )

    async def get_by_email(self, email: str) -> Optional[FastApiUser]:
        with connect_with_env() as conn:
            return optional_user_to_fast_api_user(
                select_user_by_email_fetchone(conn, email)
            )

    async def create(self, create_dict: dict[str, Any]) -> FastApiUser:
        with connect_with_env() as conn:
            user = insert_user_fetchone(
                conn,
                create_dict["email"],
                create_dict["display_name"],
                create_dict["hashed_password"],
            )
            if user is None:
                raise RuntimeError("Could not insert user")
            return user_to_fast_api_user(user)

    async def update(
        self, user: FastApiUser, update_dict: dict[str, Any]
    ) -> FastApiUser:
        with connect_with_env() as conn:
            updated_user = update_user_fetchone(
                conn,
                user.id,
                update_dict.get("email"),
                update_dict.get("display_name"),
                update_dict.get("hashed_password"),
                update_dict.get("is_active"),
                update_dict.get("is_superuser"),
                update_dict.get("is_verified"),
                update_dict.get("last_verify_request"),
            )
            if updated_user is None:
                raise RuntimeError("Could not update user")
            return user_to_fast_api_user(updated_user)

    async def delete(self, user: FastApiUser) -> None:
        with connect_with_env() as conn:
            delete_user(conn, user.id)


def get_user_db():
    yield UserDatabase()
