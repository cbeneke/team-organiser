import { getRawUsers } from './user';
import { Event } from '../types';

export function getEvents(token: string): Promise<Event[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(mockEvents);
        }, 100);
    });
}

export function getEvent(token: string, id: string): Promise<Event> {
    return new Promise((resolve, reject) => {
        const event = mockEvents.find(event => event.id == id);
        setTimeout(() => {
            if (event != undefined) {
                resolve(event);
            } else {
                reject('Event not found');
            }
        }, 100);
    });
}

const mockUsers = getRawUsers();
const mockResponses = [
    {
        user: mockUsers[0],
        status: 'accepted'
    },
    {
        user: mockUsers[1],
        status: 'declined'
    },
    {
        user: mockUsers[2],
        status: 'pending'
    }
];

const mockEvents = [
    {
        id: '5bdf37dd-1e09-4bd0-b05a-922af40d20c4',
        start_time: '2023-12-10T20:00:00',
        end_time: '2020-12-10T22:00:00',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses,
        owner: mockUsers[0],
    },
    {
        id: '39bec6b8-b208-4530-bb68-b9b313b1f1d4',
        start_time: '2023-12-12T19:00:00',
        end_time: '2020-12-12T21:00:00',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses,
        owner: mockUsers[0],
    },
    {
        id: 'a8cf228c-d916-4945-ba3b-97b6de846cb6',
        start_time: '2023-12-16T18:00:00',
        end_time: '2020-12-16T21:00:00',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses,
        owner: mockUsers[0],
    },
    {
        id: '7cf8d165-0499-4aab-a429-694ff63b639b',
        start_time: '2023-12-17T20:00:00',
        end_time: '2020-12-17T22:00:00',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses,
        owner: mockUsers[0],
    },
    {
        id: 'a4317109-081e-4a5d-89f6-970a2e386f5b',
        start_time: '2023-12-19T19:00:00',
        end_time: '2020-12-19T21:00:00',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses,
        owner: mockUsers[0],
    },
    {
        id: '944c3000-dde8-4259-9720-aa2abdea3472',
        start_time: '2023-12-20T18:00:00',
        end_time: '2020-12-24T21:00:00',
        title: 'Christmas Market',
        description: 'Christmas Market in the city center',
        responses: mockResponses,
        owner: mockUsers[1],
    },
    {
        id: '9e7407bc-2459-45e5-a712-1a73d75d7746',
        start_time: '2023-12-23T18:00:00',
        end_time: '2020-12-23T21:00:00',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses,
        owner: mockUsers[0],
    },
]