from .fixtures import admin, user, test_user, client, db

def test_list_users(client, admin):
    response = client.get(
        "/users/",
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) > 0

def test_get_me_user(client, user):
    response = client.get(
        "/users/me",
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {user['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["username"] == "user"
    assert response_data["is_active"] == True
    assert response_data["roles"][0]["name"] == "user"

def test_get_user(client, admin):
    response = client.get(
        f"/users/{admin['id']}",
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {admin['token']}"
        }
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
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "User not found"

def test_admin_update_user(client, admin, test_user):
    response = client.post(
        f"/users/{test_user['id']}",
        data={"password": "new_password", "is_trainer": True},
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert test_user["id"] == response_data["id"]
    assert response_data["roles"][0]["name"] == "trainer"

def test_user_update_user(client, user, test_user):
    response = client.post(
        f"/users/{test_user['id']}",
        data={"password": "new_password", "is_trainer": True},
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {user['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403

def test_admin_delete_user(client, admin, test_user):
    response = client.delete(
        f"/users/{test_user['id']}",
        headers={
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200

def test_user_delete_user(client, user, test_user):
    response = client.delete(
        f"/users/{test_user['id']}",
        headers={
            "Authorization": f"Bearer {user['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403

def test_delete_user_not_found(client, admin):
    response = client.delete(
        "/users/00000000-0000-4000-8000-000000000000",
        headers={
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "User not found"

def test_delete_self(client, test_user):
    response = client.delete(
        f"/users/{test_user['id']}",
        headers={
            "Authorization": f"Bearer {test_user['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200