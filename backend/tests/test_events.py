import pytest
from .fixtures import admin, user, client, db, times


@pytest.fixture(scope="function")
def new_event(admin, user, client, times):
    response = client.get(
        "/users/me", headers={"Authorization": f"Bearer {user['token']}"}
    )
    user_object = response.json()

    response = client.post(
        "/events/",
        json={
            "title": "Temporary Event",
            "description": "Temporary Description",
            "lock_time": times["in_one_hour"],
            "start_time": times["in_one_hour"],
            "end_time": times["in_two_hours"],
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
def locked_event(admin, user, client, times):
    response = client.get(
        "/users/me", headers={"Authorization": f"Bearer {admin['token']}"}
    )
    admin_object = response.json()

    response = client.post(
        "/events/",
        json={
            "title": "Temporary Event",
            "description": "Temporary Description",
            "lock_time": times["one_hour_ago"],
            "start_time": times["now"],
            "end_time": times["in_one_hour"],
            "invitees": [admin_object],
        },
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {user['token']}",
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
def new_recurring_event(admin, user, client, times):
    response = client.get(
        "/users/me", headers={"Authorization": f"Bearer {user['token']}"}
    )
    user_object = response.json()

    response = client.post(
        "/events/",
        json={
            "title": "Temporary Event",
            "description": "Temporary Description",
            "lock_time": times["in_one_hour"],
            "start_time": times["in_one_hour"],
            "end_time": times["in_two_hours"],
            "invitees": [user_object],
            "recurrence": "weekly",
        },
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {admin['token']}",
        },
    )
    print(response.json())
    response_data = response.json()
    id = response_data[0]["id"]

    yield {"id": id}

    try:
        client.delete(
            f"/events/{id}",
            params={"update_all": "true"},
            headers={"Authorization": f"Bearer {admin['token']}"},
        )
    except:
        pass


@pytest.fixture(scope="function")
def admin_only_event(admin, client, times):
    response = client.post(
        "/events/",
        json={
            "title": "Temporary Event",
            "description": "Temporary Description",
            "lock_time": times["in_one_hour"],
            "start_time": times["in_one_hour"],
            "end_time": times["in_two_hours"],
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


def test_list_events_for_marked_date(client, user, new_event, times):

    response = client.get(
        "/events/",
        params={
            "start_date": times["today"],
            "end_date": times["today"],
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


def test_list_events_for_empty_date(client, user, new_event, times):
    response = client.get(
        "/events/",
        params={
            "start_date": times["yesterday"],
            "end_date": times["yesterday"],
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
    assert response_data["detail"] == "Access denied"


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


def test_list_invalid_dates(client, user, new_event, times):
    response = client.get(
        "/events/",
        params={
            "start_date": times["tomorrow"],
            "end_date": times["today"],
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


def test_add_event(client, user, times):
    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "lock_time": times["in_one_hour"],
            "start_time": times["in_one_hour"],
            "end_time": times["in_two_hours"],
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
    assert response_data["lock_time"] == times["in_one_hour"]
    assert response_data["start_time"] == times["in_one_hour"]
    assert response_data["end_time"] == times["in_two_hours"]
    assert response_data["owner"]["id"] == user["id"]
    assert len(response_data["responses"]) == 1

    response = client.get(
        "/events/",
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == 1


def test_add_event_owner_deduplication(client, user, times):
    response = client.get(
        "/users/me", headers={"Authorization": f"Bearer {user['token']}"}
    )
    user_object = response.json()

    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "lock_time": times["in_one_hour"],
            "start_time": times["in_one_hour"],
            "end_time": times["in_two_hours"],
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
#  - Update locked event


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


def test_user_update_own_event(client, user, times):
    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "lock_time": times["in_one_hour"],
            "start_time": times["in_one_hour"],
            "end_time": times["in_two_hours"],
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
    assert response_data["detail"] == "Access denied"


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


def test_update_locked_event(client, admin, user, locked_event):
    response = client.put(
        f"/events/{locked_event['id']}",
        json={
            "title": "Other Event",
        },
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403
    assert response_data["detail"] == "Event is locked"

    response = client.put(
        f"/events/{locked_event['id']}",
        json={
            "title": "Other Event",
        },
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200


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


def test_user_delete_own_event(client, user, times):
    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "lock_time": times["in_one_hour"],
            "start_time": times["in_one_hour"],
            "end_time": times["in_two_hours"],
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
    assert response_data["detail"] == "Access denied"


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
#  - Accept locked event


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


def test_respond_locked_event(client, admin, user, locked_event):
    response = client.put(
        f"/events/{locked_event['id']}/respond",
        params={"status": "accepted"},
        headers={"Authorization": f"Bearer {user['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 403
    assert response_data["detail"] == "Event is locked"

    response = client.put(
        f"/events/{locked_event['id']}/respond",
        params={"status": "accepted"},
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200


# Test Event Series
#  - Create series
#  - Get series
#  - Update series
#  - Delete series
#  - Ensure event with series flag delete does not delete other events


def test_add_recurring_event(client, admin, times):
    response = client.post(
        "/events/",
        json={
            "title": "Test Series",
            "description": "Test Description",
            "lock_time": times["in_one_hour"],
            "start_time": times["in_one_hour"],
            "end_time": times["in_two_hours"],
            "recurrence": "weekly",
        },
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {admin['token']}",
        },
    )
    response_data = response.json()
    print(response_data)

    assert response.status_code == 201
    for event in response_data:
        assert "id" in event
        assert "series_id" in event
        assert response_data[0]["id"] == event["series_id"]

    response = client.delete(
        f"/events/{response_data[0]['id']}",
        params={"update_all": "true"},
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200


def test_get_recurring_event(client, admin, new_recurring_event):
    response = client.get(
        "/events/",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == 52
    for event in response_data:
        assert event["series_id"] == new_recurring_event["id"]


def test_update_recurring_event(client, admin, new_recurring_event):
    response = client.get(
        "/events/",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    second_event = response_data[1]

    response = client.put(
        f"/events/{second_event['id']}",
        json={
            "title": "Updated Event",
            "update_all": "true",
        },
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200

    response = client.get(
        "/events/",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == 52
    assert response_data[0]["title"] == "Temporary Event"
    for event in response_data[1:]:
        assert event["title"] == "Updated Event"


def test_delete_recurring_event(client, admin, new_recurring_event):
    response = client.get(
        "/events/",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    some_event = response_data[12]

    response = client.delete(
        f"/events/{some_event['id']}",
        params={"update_all": "true"},
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200

    response = client.get(
        "/events/",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == 12


def test_delete_event_with_update_all_flag(client, admin, new_event, times):
    response = client.post(
        "/events/",
        json={
            "title": "Test Event",
            "description": "Test Description",
            "lock_time": times["in_one_hour"],
            "start_time": times["in_one_hour"],
            "end_time": times["in_two_hours"],
        },
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {admin['token']}",
        },
    )
    response_data = response.json()
    print(response_data)

    assert response.status_code == 201
    assert "id" in response_data

    event_id = response_data["id"]

    response = client.get(
        "/events/",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    response_length = len(response_data)

    response = client.delete(
        f"/events/{event_id}",
        params={"update_all": "true"},
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200

    response = client.get(
        "/events/",
        headers={"Authorization": f"Bearer {admin['token']}"},
    )

    response_data = response.json()
    print(response_data)

    assert response.status_code == 200
    assert len(response_data) == response_length - 1
