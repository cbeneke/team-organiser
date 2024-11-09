from fastapi.testclient import TestClient
import os
import pytest
import sqlite3
from alembic.config import Config
from alembic import command
from datetime import datetime, timedelta

from src.main import app
from .utils import get_random_string


@pytest.fixture(scope="session")
def db():
    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", os.environ.get("DATABASE_URL"))
    command.upgrade(config, "head")

    connection = sqlite3.connect("tests.db")
    db = connection.cursor()

    yield db

    connection.close()
    # Deletion succeeds, but pytest still complains about the file not being found
    try:
        os.remove(os.environ.get("DATABASE_FILE"))
    except OSError:
        pass


@pytest.fixture(scope="session")
def client(db):
    client = TestClient(app)
    yield client


@pytest.fixture(scope="session")
def times():
    now = datetime.now()
    return {
        "two_hours_ago": (now - timedelta(hours=2)).isoformat(),
        "one_hour_ago": (now - timedelta(hours=1)).isoformat(),
        "now": now.isoformat(),
        "in_one_hour": (now + timedelta(hours=1)).isoformat(),
        "in_two_hours": (now + timedelta(hours=2)).isoformat(),
        "in_three_hours": (now + timedelta(hours=3)).isoformat(),
        "yesterday": (now - timedelta(days=1)).date().isoformat(),
        "today": now.date().isoformat(),
        "tomorrow": (now + timedelta(days=1)).date().isoformat(),
    }


@pytest.fixture(scope="session")
def admin(client):
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "admin", "grant_type": "password"},
    )

    response_data = response.json()
    print(response_data)
    token = response_data["access_token"]

    response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    response_data = response.json()
    print(response_data)
    id = response_data["id"]
    yield {"token": token, "id": id}


@pytest.fixture(scope="session")
def user(client):
    username = get_random_string(16)
    password = get_random_string(16)

    response = client.post(
        "/auth/register",
        data={"username": username, "password": password},
    )
    response_data = response.json()
    print(response_data)
    id = response_data["id"]

    response = client.post(
        "/auth/login",
        data={"username": username, "password": password, "grant_type": "password"},
    )
    response_data = response.json()
    print(response_data)
    token = response_data["access_token"]

    yield {"token": token, "id": id, "username": username}

    try:
        client.delete(f"/users/{id}", headers={"Authorization": f"Bearer {token}"})
    except:
        pass
