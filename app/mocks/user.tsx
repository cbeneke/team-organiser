import { User, Token } from "../types";
import { MockHttpResponse } from "./types";
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

export function postLogin(username: string, password: string): Promise<MockHttpResponse<Token>> {
    return new Promise((resolve, reject) => {
        const user = mockUsers.find(i => i.username == username);
        const token = getToken(username);
        setTimeout(() => {
            if (user && password == 'pass') {
                mockCurrentUser = user;
                resolve({status: 200, data: {accessToken: token, tokenType: 'bearer'}});
            } else {
                reject({status: 404, data: {}});
            }
        }, 100);
    });
}

export function postRegister(username: string, password: string): Promise<MockHttpResponse<User>> {
    return new Promise((resolve, reject) => {
        const newUser = {id: uuidv4(), username: username, firstname: username, language: 'de'}
        mockUsers.push(newUser);
        setTimeout(() => {
            resolve({status: 200, data: newUser});
        }, 100);
    });

}

export function getUsersMe(): Promise<MockHttpResponse<User>> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({status: 200, data: mockCurrentUser});
        }, 100);
    });
}

export function getUser(id: string): Promise<MockHttpResponse<User>> {
    return new Promise((resolve, reject) => {
        const user = mockUsers.find(user => user.id == id);
        setTimeout(() => {
            if (user != undefined) {
                resolve({status: 200, data: user});
            } else {
                reject({});
            }
        }, 100);
    });
}

export function getUsers(): Promise<MockHttpResponse<User[]>> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({status: 200, data: mockUsers});
        }, 100);
    });
}

export function getRawUsers(): User[] {
    return mockUsers;
}


let mockUsers = [
    {
        id: 'd0f7d07c-88a6-449d-afab-78343c19227c',
        username: 'lisa',
        firstname: 'Lisa',
        language: 'de',
    },
    {
        id: '7c813ca2-a895-4349-a36f-a4317cee6dcf',
        username: 'helen',
        firstname: 'Helen',
        language: 'en',
    },
    {
        id: 'a8962fc5-b1b4-4ac5-b1e4-c7665efcf931',
        username: 'maurice',
        firstname: 'Maurice',
        language: 'de',
    },
]

let mockCurrentUser = null;