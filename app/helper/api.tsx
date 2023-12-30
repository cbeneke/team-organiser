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

export function getEvent(id: string) {
    // TODO: Implement me
}