import fastapi

import src.auth.router as auth
import src.users.router as user


app = fastapi.FastAPI()
app.include_router(auth.router, prefix="/auth")
app.include_router(user.router, prefix="/users")

@app.get("/")
async def root():
    return
