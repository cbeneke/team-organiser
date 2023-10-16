import fastapi

import src.auth.router as auth

app = fastapi.FastAPI()
app.include_router(auth.router, prefix="/auth")

@app.get("/")
async def root():
    return
