from .fixtures import admin, user, test_user, client, db

def test_list_events(client, user):
    response = client.get(
        "/events/",
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {user['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) >= 0

def test_create_event(client, user):
    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "start_time": "2023-01-01T10:00:00.000Z",
            "end_time": "2023-01-01T12:00:00.000Z"
        },
        headers={
            "Authorization": f"Bearer {user['token']}"
        }
    )

    print(response)
    response_data = response.json()
    print(response_data)

    assert response.status_code == 201
    assert response_data["title"] == "Test Event"
    assert response_data["description"] == "Test Description"
    assert response_data["start_time"] == "2023-01-01T10:00:00"
    assert response_data["end_time"] == "2023-01-01T12:00:00"

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

def test_get_event_not_found(client, admin):
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