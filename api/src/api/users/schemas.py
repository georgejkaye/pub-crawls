from fastapi_users import schemas


class UserRead(schemas.BaseUser[int]):
    display_name: str
    pass


class UserCreate(schemas.BaseUserCreate):
    display_name: str
    pass


class UserUpdate(schemas.BaseUserUpdate):
    display_name: str
    pass
