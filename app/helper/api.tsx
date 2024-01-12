import { NewEvent, UpdateUser, UpdateEvent } from '../types';

export function postLogin(username: string, password: string) {
    return fetch('https://pb-api.rootlink.de/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body: 'grant_type=password&username=' + username + '&password=' + password + '&scope=&client_id=&client_secret='
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error(error);
    });
}

export function postRegister(username: string, password: string) {
    // TODO: Implement me
}

export function getUsersMe(token: string) {
    return fetch('https://pb-api.rootlink.de/users/me', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
        },
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error(error);
    });
}

export function getUser(id: string) {
    // TODO: Implement me
}

export function getUsers() {
    // TODO: Implement me
}

export function getEvents(token: string, userID: string) {
    return fetch('https://pb-api.rootlink.de/users/' + userID + '/events', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
        },
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error(error);
    });
}

export function getEvent(token: string, id: string) {
    return fetch('https://pb-api.rootlink.de/events/' + id, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
        },
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error(error);
    });
}

export function putEventResponse(token: string, eventID: string, status: string) {
    return fetch('https://pb-api.rootlink.de/events/' + eventID + '/respond?' + new URLSearchParams({
            status: status
        }), {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
        },
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error(error);
    });
}

export function putUser(token: string, userID: string, update: UpdateUser) {
    return fetch('https://pb-api.rootlink.de/users/' + userID, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(update)
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error(error);
    });
}

export function postEvent(token: string, event: NewEvent) {
    return fetch('https://pb-api.rootlink.de/events/', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error(error);
    });
}

export function updateEvent(token: string, eventID: string, event: UpdateEvent) {
    // TODO: Implement me
}