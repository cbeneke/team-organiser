from fastapi.testclient import TestClient
import os
import pytest
import sqlite3
from alembic.config import Config
from alembic import command

from src.main import app

@pytest.fixture(scope='session')
def db():
    config = Config('alembic.ini')
    config.set_main_option('sqlalchemy.url', os.environ["DATABASE_URL"])
    command.upgrade(config, 'head')

    connection = sqlite3.connect('tests.db')
    db = connection.cursor()

    yield db

    connection.close()
    # Deletion succeeds, but pytest still complains about the file not being found
    try:
        os.remove('tests.db')
    except OSError:
        pass

@pytest.fixture(scope='session')
def client(db):
    client = TestClient(app)
    yield client

@pytest.fixture(scope='session')
def admin_token(client):
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "admin", "grant_type": "password"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )

    token = response.json()["access_token"]
    yield token
