import fastapi

import src.auth.router as auth
import src.users.router as user
import src.events.router as events


app = fastapi.FastAPI()
app.include_router(auth.router, prefix="/auth")
app.include_router(user.router, prefix="/users")
app.include_router(events.router, prefix="/events")

@app.get("/")
async def root():
    return
