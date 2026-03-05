import os
from typing import Optional


def get_env_variable(key: str) -> Optional[str]:
    val = os.environ.get(key)
    return val


def get_env_variable_force(key: str) -> str:
    variable = get_env_variable(key)
    if variable is None:
        raise RuntimeError(f"Environment variable {key} not found")
    return variable


def get_env_variable_with_default(key: str, default: str) -> str:
    variable = get_env_variable(key)
    return variable if variable is not None else default


def get_secret_file_contents(file: str) -> str:
    with open(file, "r") as f:
        return f.readline().rstrip()


def get_secret(key: str) -> Optional[str]:
    file = get_env_variable(key)
    if file is not None and os.path.exists(file):
        return get_secret_file_contents(file)
    return None


def get_secret_force(key: str) -> str:
    secret = get_secret(key)
    if secret is None:
        raise RuntimeError(f"Secret {key} not found")
    return secret
