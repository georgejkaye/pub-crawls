from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)

from api.users.db import FastApiUser
from api.utils import get_secret_force

secret = get_secret_force("USER_SECRET")

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy[FastApiUser, int]:
    return JWTStrategy[FastApiUser, int](secret=secret, lifetime_seconds=3600)


auth_backend = AuthenticationBackend(
    name="jwt", transport=bearer_transport, get_strategy=get_jwt_strategy
)
