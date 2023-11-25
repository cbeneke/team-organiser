from .fixtures import admin, user, test_user, client, db, get_random_string

def test_list_users(client, admin):
    response = client.get(
        "/users/",
        headers={
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
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "User not found"

def test_admin_update_user(client, admin, test_user):
    response = client.put(
        f"/users/{test_user['id']}",
        json={"is_trainer": True},
        headers={
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert test_user["id"] == response_data["id"]
    assert response_data["roles"][0]["name"] == "trainer"

def test_user_update_user(client, user, test_user):
    response = client.put(
        f"/users/{test_user['id']}",
        json={"is_trainer": True},
        headers={
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

def test_update_password(client, test_user):
    password = get_random_string(16)
    assert test_user['password'] != password

    response = client.put(
        f"/users/{test_user['id']}",
        json={"password": password},
        headers={
            "Authorization": f"Bearer {test_user['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200

    response = client.post(
        "/auth/login",
        data={"username": test_user['username'], "password": test_user['password'], "grant_type": "password"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 401

    response = client.post(
        "/auth/login",
        data={"username": test_user['username'], "password": password, "grant_type": "password"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert "access_token" in response_data
    assert response_data["token_type"] == "bearer"
