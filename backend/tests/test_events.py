from .fixtures import admin, user, test_event, test_user, client, db

def test_list_events(client, user):
    response = client.get(
        "/events/",
        headers={
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

    response_data = response.json()
    print(response_data)

    assert response.status_code == 201
    assert response_data["title"] == "Test Event"
    assert response_data["description"] == "Test Description"
    assert response_data["start_time"] == "2023-01-01T10:00:00"
    assert response_data["end_time"] == "2023-01-01T12:00:00"

def test_create_invalid_event(client, user):
    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "start_time": "2023-01-01T12:00:00.000Z",
            "end_time": "2023-01-01T10:00:00.000Z"
        },
        headers={
            "Authorization": f"Bearer {user['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 400
    assert response_data["detail"] == "Event Start Date must be before End Date"

def test_get_event_not_found(client, admin):
    response = client.get(
        "/events/00000000-0000-4000-8000-000000000000",
        headers={
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "Event not found"

def test_admin_update_event(client, admin, test_event):
    response = client.put(
        f"/events/{test_event['id']}",
        params={"title": "New Title"},
        headers={
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["title"] == "New Title"

def test_user_update_event(client, user, test_event):
    response = client.put(
        f"/events/{test_event['id']}",
        params={"title": "New Title"},
        headers={
            "Authorization": f"Bearer {user['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403

def test_admin_delete_event(client, admin, test_event):
    response = client.delete(
        f"/events/{test_event['id']}",
        headers={
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200

def test_user_delete_event(client, user, test_event):
    response = client.delete(
        f"/events/{test_event['id']}",
        headers={
            "Authorization": f"Bearer {user['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403

def test_delete_event_not_found(client, admin):
    response = client.delete(
        "/events/00000000-0000-4000-8000-000000000000",
        headers={
            "Authorization": f"Bearer {admin['token']}"
        }
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "Event not found"