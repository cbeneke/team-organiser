from .fixtures import admin_token, client, db

def test_list_users(client, admin_token):
    response = client.get(
        "/users/",
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {admin_token}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == 2
    assert response_data[0]["username"] == "admin"
    assert response_data[1]["username"] == "user"


def test_get_me_user(client):
    response = client.get(
        "/users/me",
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {admin_token}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["username"] == "admin"
    assert response_data["is_active"] == True
    assert response_data["roles"][0]["name"] == "admin"


def test_get_user_not_found(client):
    response = client.get(
        "/users/00000000-0000-4000-8000-000000000000",
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {admin_token}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "User not found"