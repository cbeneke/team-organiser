import pytest

from .fixtures import admin, user, client, db


@pytest.fixture(scope="function")
def new_event(admin, client):
    response = client.post(
        "/events/",
        json={
            "title": "Temporary Event",
            "description": "Temporary Description",
            "start_time": "2023-01-01T12:00:00",
            "end_time": "2023-01-01T13:00:00",
        },
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {admin['token']}",
        },
    )
    print(response.json())
    response_data = response.json()
    id = response_data["id"]

    yield {"id": id}

    client.delete(
        f"/events/{id}", headers={"Authorization": f"Bearer {admin['token']}"}
    )


def test_list_events(client, user):
    response = client.get(
        "/events/",
        headers={
            "Authorization": f"Bearer {user['token']}",
        },
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200


def test_add_event(client, user):
    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "start_time": "2023-01-01T12:00:00",
            "end_time": "2023-01-01T13:00:00",
        },
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {user['token']}",
        },
    )
    response_data = response.json()
    print(response_data)

    assert response.status_code == 201
    assert response_data["title"] == "Test Event"
    assert response_data["description"] == "Test Description"
    assert response_data["start_time"] == "2023-01-01T12:00:00"
    assert response_data["end_time"] == "2023-01-01T13:00:00"


def test_get_event(client, user, new_event):
    response = client.get(
        f"/events/{new_event['id']}",
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200


def test_get_event_not_found(client, user):
    response = client.get(
        "/events/00000000-0000-4000-8000-000000000000",
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "Event not found"


def test_admin_update_event(client, admin, new_event):
    response = client.put(
        f"/events/{new_event['id']}",
        data={},
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200


def test_user_update_event(client, user, new_event):
    response = client.put(
        f"/events/{new_event['id']}",
        data={},
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403


def test_admin_delete_event(client, admin, new_event):
    response = client.delete(
        f"/events/{new_event['id']}",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200


def test_user_delete_own_event(client, user, new_event):
    response = client.post(
        "/events/", headers={"Authorization": f"Bearer {user['token']}"}
    )

    response = client.delete(
        f"/events/{new_event['id']}",
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403


def test_user_delete_event(client, user, new_event):
    response = client.delete(
        f"/events/{new_event['id']}",
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403


def test_delete_event_not_found(client, admin):
    response = client.delete(
        "/events/00000000-0000-4000-8000-000000000000",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "Event not found"
