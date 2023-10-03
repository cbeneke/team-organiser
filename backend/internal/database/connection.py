from .defaults import *


async def connect():
    await database.connect()


async def disconnect():
    await database.disconnect()
