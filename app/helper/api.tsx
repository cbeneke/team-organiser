import { Event, NewEvent, UpdateUser, UpdateEvent } from '../types';

export function postLogin(username: string, password: string) {
    return fetch('https://' + process.env.API_DOMAIN + '/auth/login', {
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
    return fetch('https://' + process.env.API_DOMAIN + '/users/me', {
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

export function getUsers(token: string) {
    return fetch('https://' + process.env.API_DOMAIN + '/users/', {
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

export function getEvents(token: string) {
    return fetch('https://' + process.env.API_DOMAIN + '/events/', {
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
    return fetch('https://' + process.env.API_DOMAIN + '/events/' + id, {
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
    return fetch('https://' + process.env.API_DOMAIN + '/events/' + eventID + '/respond?' + new URLSearchParams({
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
    return fetch('https://' + process.env.API_DOMAIN + '/users/' + userID, {
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
    return fetch('https://' + process.env.API_DOMAIN + '/events/', {
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

export function putEvent(token: string, eventID: string, event: UpdateEvent) {
    return fetch('https://' + process.env.API_DOMAIN + '/events/' + eventID, {
        method: 'PUT',
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

export function deleteEvent(token: string, event: Event) {
    return fetch('https://' + process.env.API_DOMAIN + '/events/' + event.id, {
        method: 'DELETE',
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