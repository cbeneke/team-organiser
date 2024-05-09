import fastapi
from fastapi.middleware.cors import CORSMiddleware

import src.auth.router as auth
import src.users.router as user
import src.events.router as events


app = fastapi.FastAPI()

origins = [
    "http://localhost:19006",
    "https://pb.wirelab.org",
    "https://pbdev.wirelab.org",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(user.router, prefix="/users")
app.include_router(events.router, prefix="/events")


@app.get("/")
async def root():
    return
