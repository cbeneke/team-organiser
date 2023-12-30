import { User, Token } from "../types";
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

function getToken(username: string): string {
    function base64url(source) {
        // Encode in classical base64
        let encodedSource = CryptoJS.enc.Base64.stringify(source);
      
        // Remove padding equal characters
        encodedSource = encodedSource.replace(/=+$/, '');
      
        // Replace characters according to base64url specifications
        encodedSource = encodedSource.replace(/\+/g, '-');
        encodedSource = encodedSource.replace(/\//g, '_');
      
        return encodedSource;
    }

    const header = {
        "alg": "HS256",
        "typ": "JWT"
    }
    const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
    const data = {
        "sub": "1234567890",
        "name": username,
        "iat": Math.floor(Date.now() / 1000)
    }
    const stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
    const unsignedToken = base64url(stringifiedHeader) + "." + base64url(stringifiedData) + "." + 'someRandomData'

    // This is not a real JWT token, but sufficient for the mock
    return unsignedToken
}

export function postLogin(username: string, password: string): Promise<Token> {
    return new Promise((resolve, reject) => {
        const user = mockUsers.find(i => i.username == username);
        const token = getToken(username);
        setTimeout(() => {
            if (user && password == 'pass' && user.is_active) {
                mockCurrentUser = user;
                resolve({access_token: token, token_type: 'bearer'});
            } else {
                reject({});
            }
        }, 500);
    });
}

export function postRegister(username: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
        const newUser = {id: uuidv4(), username: username, firstname: username, language: 'de', is_active: false, roles: [mockRoles[1]]}
        mockUsers.push(newUser);
        setTimeout(() => {
            resolve(newUser);
        }, 100);
    });
}

export function getUsersMe(token: string): Promise<User> {
    return new Promise((resolve, reject) => {
        const tokenValid = getToken(mockCurrentUser.username) == token;
        setTimeout(() => {
            if (tokenValid) {
                resolve(mockCurrentUser);
            } else {
                reject({});
            }
        }, 100);
    });
}

export function getUser(token: string, id: string): Promise<User> {
    return new Promise((resolve, reject) => {
        const user = mockUsers.find(user => user.id == id);
        setTimeout(() => {
            if (user != undefined) {
                resolve(user);
            } else {
                reject({});
            }
        }, 100);
    });
}

export function getUsers(token: string): Promise<User[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(mockUsers);
        }, 100);
    });
}

export function getRawUsers(): User[] {
    return mockUsers;
}

export function putUser(token: string, user: User): Promise<User> {
    // TODO: Implement me
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(user);
        }, 100);
    });
}

let mockRoles = [
    {
        "name": "trainer",
        "description": "A trainer can create and manage training sessions.",
    },
    {
        "name": "user",
        "description": "A user can participate in training sessions.",
    },
]

let mockUsers = [
    {
        id: 'd0f7d07c-88a6-449d-afab-78343c19227c',
        username: 'lisa',
        firstname: 'Lisa',
        language: 'de',
        is_active: true,
        roles: [mockRoles[0]],
    },
    {
        id: '7c813ca2-a895-4349-a36f-a4317cee6dcf',
        username: 'helen',
        firstname: 'Helen',
        language: 'en',
        is_active: true,
        roles: [mockRoles[1]],
    },
    {
        id: 'a8962fc5-b1b4-4ac5-b1e4-c7665efcf931',
        username: 'maurice',
        firstname: 'Maurice',
        language: 'de',
        is_active: true,
        roles: [mockRoles[1]],
    },
]

let mockCurrentUser = null;