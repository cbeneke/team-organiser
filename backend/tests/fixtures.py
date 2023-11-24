from fastapi.testclient import TestClient
import os
import pytest
import sqlite3
import string
import random
from alembic.config import Config
from alembic import command

from src.main import app

@pytest.fixture(scope='session')
def db():
    config = Config('alembic.ini')
    config.set_main_option('sqlalchemy.url', os.environ.get("DATABASE_URL"))
    command.upgrade(config, 'head')

    connection = sqlite3.connect('tests.db')
    db = connection.cursor()

    yield db

    connection.close()
    # Deletion succeeds, but pytest still complains about the file not being found
    try:
        os.remove(os.environ.get("DATABASE_FILE"))
    except OSError:
        pass

@pytest.fixture(scope='session')
def client(db):
    client = TestClient(app)
    yield client

@pytest.fixture(scope='session')
def admin(client):
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "admin", "grant_type": "password"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )

    token = response.json()["access_token"]

    response = client.get(
        "/users/me",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )
    id = response.json()["id"]
    yield {'token': token, 'id': id}


@pytest.fixture(scope='function')
def user(client):
    response = client.post(
        "/auth/register",
        data={"username": "user", "password": "user"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    id = response.json()["id"]

    response = client.post(
        "/auth/login",
        data={"username": "user", "password": "user", "grant_type": "password"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    token = response.json()["access_token"]

    yield {'token': token, 'id': id}

    try:
        client.delete(
            f"/users/{id}",
            headers={"Authorization": f"Bearer {token}"}
        )
    except:
        pass

@pytest.fixture(scope='function')
def test_user(client):
    username = get_random_string(16)
    password = get_random_string(16)

    response = client.post(
        "/auth/register",
        data={"username": username, "password": password},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    print(response.json())
    response_data = response.json()
    id = response_data["id"]

    response = client.post(
        "/auth/login",
        data={"username": username, "password": password, "grant_type": "password"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )
    print(response.json())
    response_data = response.json()
    token = response_data["access_token"]

    yield {'token': token, 'id': id}

    client.delete(
        f"/users/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )

def get_random_string(length: int, hex: bool = False):
    letters = string.ascii_lowercase if not hex else string.hexdigits
    return ''.join(random.choice(letters) for _ in range(length))