from .fixtures import admin, client, db

def test_login(client):
    response = client.post(
        "/auth/login",
        data={"username": "admin", "password": "admin", "grant_type": "password"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert "access_token" in response_data
    assert response_data["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    response = client.post(
        "/auth/login",
        data={"username": "invalid", "password": "user", "grant_type": "password"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 401
    assert "access_token" not in response_data
    assert "token_type" not in response_data


def test_register_user(client):
    response = client.post(
        "/auth/register",
        data={"username": "new_user", "password": "test"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["username"] == "new_user"
    assert "password" not in response_data
    assert response_data["is_active"] == True
    assert len(response_data["roles"]) == 1
    assert response_data["roles"][0]["name"] == "user"


def test_register_existing_username(client):
    response = client.post(
        "/auth/register",
        data={"username": "new_user", "password": "other"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 400
