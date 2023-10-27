import pytest

from .fixtures import admin, user, client, db
from .utils import get_random_string


@pytest.fixture(scope="function")
def new_user(client):
    username = get_random_string(16)
    password = get_random_string(16)

    response = client.post(
        "/auth/register",
        data={"username": username, "password": password},
    )
    print(response.json())
    response_data = response.json()
    id = response_data["id"]

    response = client.post(
        "/auth/login",
        data={"username": username, "password": password, "grant_type": "password"},
    )
    print(response.json())
    response_data = response.json()
    token = response_data["access_token"]

    yield {"token": token, "id": id}

    client.delete(f"/users/{id}", headers={"Authorization": f"Bearer {token}"})


def test_list_users(client, admin):
    response = client.get(
        "/users/",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) > 0


def test_get_me_user(client, user):
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["username"] == user["username"]
    assert response_data["is_active"] == True
    assert response_data["roles"][0]["name"] == "user"


def test_get_user(client, admin):
    response = client.get(
        f"/users/{admin['id']}",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["username"] == "admin"
    assert response_data["is_active"] == True
    assert response_data["roles"][0]["name"] == "trainer"


def test_get_user_not_found(client, admin):
    response = client.get(
        "/users/00000000-0000-4000-8000-000000000000",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "User not found"


def test_admin_update_user(client, admin, new_user):
    response = client.post(
        f"/users/{new_user['id']}",
        data={"password": "new_password", "is_trainer": True},
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert new_user["id"] == response_data["id"]
    assert response_data["roles"][0]["name"] == "trainer"


def test_user_update_user(client, user, new_user):
    response = client.post(
        f"/users/{new_user['id']}",
        data={"password": "new_password", "is_trainer": True},
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403


def test_admin_delete_user(client, admin, new_user):
    response = client.delete(
        f"/users/{new_user['id']}",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200


def test_user_delete_user(client, user, new_user):
    response = client.delete(
        f"/users/{new_user['id']}", headers={"Authorization": f"Bearer {user['token']}"}
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403


def test_delete_user_not_found(client, admin):
    response = client.delete(
        "/users/00000000-0000-4000-8000-000000000000",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "User not found"


def test_delete_self(client, new_user):
    response = client.delete(
        f"/users/{new_user['id']}",
        headers={"Authorization": f"Bearer {new_user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
