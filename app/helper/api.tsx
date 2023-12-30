import { User } from '../types';

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

export function getEvents(token: string) {
    return fetch('https://pb-api.rootlink.de/events/', {
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

export function putEventResponse(token: string, eventID: string, userID: string, status: string) {
    return fetch('https://pb-api.rootlink.de/events/' + eventID + '/responses/' + userID  + '?' + new URLSearchParams({
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

export function putUser(token: string, user: User) {
    return fetch('https://pb-api.rootlink.de/users/' + user.id, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json',
        },
        body: JSON.stringify(user)
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error(error);
    });
}