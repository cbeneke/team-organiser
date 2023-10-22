from .fixtures import client, db

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


def test_create_user(client):
    response = client.post(
        "/auth/register",
        data={"username": "user", "password": "test"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["username"] == "user"
    assert "password" not in response_data
    assert response_data["is_active"] == True
    assert response_data["roles"][0]["name"] == "user"


def test_create_user_again(client):
    response = client.post(
        "/auth/register",
        data={"username": "user", "password": "other"},
        headers={"content-type": "application/x-www-form-urlencoded"}
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 400
