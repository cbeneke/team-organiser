from .defaults import *
from ...routers import auth

users = sql.Table(
    "users",
    metadata,
    sql.Column("id", sql.Integer, primary_key=True, index=True),
    sql.Column("username", sql.String, unique=True, index=True),
    sql.Column("email", sql.String, default=""),
    sql.Column("hashed_password", sql.String),
    sql.Column("is_active", sql.Boolean, default=True),
)


class User(BaseModel):
    username: str
    email: Union[str, None] = None
    full_name: Union[str, None] = None
    is_active: Union[bool, None] = None


class NewUser(BaseModel):
    username: str
    hashed_password: str


async def get_user(username: str):
    query = users.select().where(users.c.username == username)
    result = await database.fetch_all(query)
    if len(result) != 1:
        return None
    return result[0]


async def add_user(username: str, password: str):
    if await get_user(username):
        return None
    hashed_password = auth.get_password_hash(password)
    query = users.insert().values(username=username, hashed_password=hashed_password, is_active=True)
    last_record_id = await database.execute(query)
    return {"id": last_record_id}
