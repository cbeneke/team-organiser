import pytest

from .fixtures import admin, user, client, db


@pytest.fixture(scope="function")
def new_event(admin, user, client):
    response = client.get(
        "/users/me", headers={"Authorization": f"Bearer {user['token']}"}
    )
    user_object = response.json()

    response = client.post(
        "/events/",
        json={
            "title": "Temporary Event",
            "description": "Temporary Description",
            "start_time": "2023-01-01T12:00:00",
            "end_time": "2023-01-01T13:00:00",
            "display_color": "#000000",
            "invitees": [user_object],
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

    try:
        client.delete(
            f"/events/{id}", headers={"Authorization": f"Bearer {admin['token']}"}
        )
    except:
        pass

@pytest.fixture(scope="function")
def admin_only_event(admin, client):

    response = client.post(
        "/events/",
        json={
            "title": "Temporary Event",
            "description": "Temporary Description",
            "start_time": "2023-01-01T13:00:00",
            "end_time": "2023-01-01T14:00:00",
            "display_color": "#000000",
            "invitees": [],
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

    try:
        client.delete(
            f"/events/{id}", headers={"Authorization": f"Bearer {admin['token']}"}
        )
    except:
        pass


# List Event tests:
#  - List own events
#  - List Events for specific date range
#  - List Events for specific date range with no events
#  - List all events as user
#  - List all events as admin
#  - Validate dates are valid (start_date before end_date)


def test_list_own_events(client, user, new_event, admin_only_event):
    response = client.get(
        "/events/",
        headers={
            "Authorization": f"Bearer {user['token']}",
        },
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == 1
    assert response_data[0]["id"] == new_event["id"]


def test_list_events_for_marked_date(client, user, new_event):
    response = client.get(
        "/events/",
        params={
            "start_date": "2023-01-01",
            "end_date": "2023-01-01",
        },
        headers={
            "Authorization": f"Bearer {user['token']}",
        },
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == 1
    assert response_data[0]["id"] == new_event["id"]


def test_list_events_for_empty_date(client, user, new_event):
    response = client.get(
        "/events/",
        params={
            "start_date": "2023-01-02",
            "end_date": "2023-01-02",
        },
        headers={
            "Authorization": f"Bearer {user['token']}",
        },
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == 0

def test_list_all_events_as_user(client, user, new_event, admin_only_event):
    response = client.get(
        "/events/all",
        headers={
            "Authorization": f"Bearer {user['token']}",
        },
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403
    assert response_data["detail"] == 'Access denied'


def test_list_all_events_as_admin(client, admin, new_event, admin_only_event):
    response = client.get(
        "/events/all",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == 2
    assert response_data[0]["id"] == new_event["id"]
    assert response_data[1]["id"] == admin_only_event["id"]

def test_list_invalid_dates(client, user, new_event):
    response = client.get(
        "/events/",
        params={
            "start_date": "2023-01-02",
            "end_date": "2023-01-01",
        },
        headers={
            "Authorization": f"Bearer {user['token']}",
        },
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 400


# Add Event tests
#  - Add new event
#  - Add new event with explicit owner invitation


def test_add_event(client, user):
    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "start_time": "2023-01-01T12:00:00",
            "end_time": "2023-01-01T13:00:00",
            "display_color": "#000000",
        },
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {user['token']}",
        },
    )
    response_data = response.json()
    print(response_data)

    assert response.status_code == 201
    assert "id" in response_data
    assert response_data["title"] == "Test Event"
    assert response_data["description"] == "Test Description"
    assert response_data["start_time"] == "2023-01-01T12:00:00"
    assert response_data["end_time"] == "2023-01-01T13:00:00"
    assert response_data["display_color"] == "#000000"
    assert response_data["owner"]["id"] == user["id"]
    assert len(response_data["responses"]) == 1


def test_add_event_owner_deduplicatoin(client, user):
    response = client.get(
        "/users/me", headers={"Authorization": f"Bearer {user['token']}"}
    )
    user_object = response.json()

    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "start_time": "2023-01-01T12:00:00",
            "end_time": "2023-01-01T13:00:00",
            "display_color": "#000000",
            "invitees": [user_object],
        },
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {user['token']}",
        },
    )
    response_data = response.json()
    print(response_data)

    assert response.status_code == 201
    assert "id" in response_data
    assert len(response_data["responses"]) == 1


# Get Event tests
#  - Get valid event ID
#  - Get invalid event ID


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


# Update Event tests
#  - Update event as admin
#  - Update event as user
#  - Update event as owner
#  - Update invalid event ID
#  - Update invitees


def test_admin_update_event(client, admin, new_event):
    response = client.put(
        f"/events/{new_event['id']}",
        json={
            "title": "Other Event",
        },
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["id"] == new_event["id"]
    assert response_data["title"] == "Other Event"


def test_user_update_own_event(client, user):
    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "start_time": "2023-01-01T12:00:00",
            "end_time": "2023-01-01T13:00:00",
            "display_color": "#000000",
        },
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {user['token']}",
        },
    )
    event = response.json()

    response = client.put(
        f"/events/{event['id']}",
        json={
            "title": "Other Event",
        },
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["id"] == event["id"]
    assert response_data["title"] == "Other Event"
    assert response_data["description"] == "Test Description"

    try:
        client.delete(
            f"/events/{event['id']}",
            headers={"Authorization": f"Bearer {user['token']}"},
        )
    except:
        pass


def test_user_update_event(client, user, new_event):
    response = client.put(
        f"/events/{new_event['id']}",
        json={
            "title": "Other Event",
        },
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403


def test_update_event_not_found(client, admin):
    response = client.put(
        "/events/00000000-0000-4000-8000-000000000000",
        data={},
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "Event not found"


def test_update_invitees(client, admin, new_event):
    response = client.get(
        "/users/me", headers={"Authorization": f"Bearer {admin['token']}"}
    )
    response_data = response.json()

    response = client.put(
        f"/events/{new_event['id']}",
        json={
            "invitees": [response_data],
        },
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["id"] == new_event["id"]
    assert len(response_data["responses"]) == 1


# Delete Event tests
#  - Delete event as admin
#  - Delete event as owner
#  - Delete event as user
#  - Delete invalid event ID
#  - Ensure deleted events do not have responses anymore


def test_admin_delete_event(client, admin, new_event):
    response = client.delete(
        f"/events/{new_event['id']}",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200


def test_user_delete_own_event(client, user):
    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "start_time": "2023-01-01T12:00:00",
            "end_time": "2023-01-01T13:00:00",
            "display_color": "#000000",
        },
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {user['token']}",
        },
    )
    event = response.json()

    response = client.delete(
        f"/events/{event['id']}",
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200


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


def test_delete_event_responses(client, admin, new_event):
    response = client.delete(
        f"/events/{new_event['id']}",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200

    response = client.get(
        f"/events/",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )
    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == 0


# Test Event Responses
#  - Decline event as invited user
#  - Accept event as not-invited user


def test_user_decline_event(client, user, new_event):
    response = client.put(
        f"/events/{new_event['id']}/respond",
        params={"status": "declined"},
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert response_data["user"]["id"] == user["id"]
    assert response_data["status"] == "declined"

    response = client.get(
        f"/events/{new_event['id']}",
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data["responses"]) == 2  # Test Event has admin and user invites
    assert response_data["responses"][0]["user"]["id"] == user["id"]
    assert response_data["responses"][0]["status"] == "declined"


def test_user_accept_non_invited(client, admin, user, new_event):
    response = client.get(
        "/users/me", headers={"Authorization": f"Bearer {admin['token']}"}
    )
    response_data = response.json()

    response = client.put(
        f"/events/{new_event['id']}",
        json={
            "invitees": [response_data],
        },
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200

    response = client.put(
        f"/events/{new_event['id']}/respond",
        params={"status": "accepted"},
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 404
    assert response_data["detail"] == "User not invited to event"
