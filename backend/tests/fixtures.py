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
    os.remove('tests.db')

@pytest.fixture(scope='session')
def client(db):
    client = TestClient(app)
    yield client
