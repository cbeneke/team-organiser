import fastapi
from .routers import auth
from .internal import database as db

app = fastapi.FastAPI()

app.include_router(auth.router)


@app.get("/")
async def root():
    return


@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()
