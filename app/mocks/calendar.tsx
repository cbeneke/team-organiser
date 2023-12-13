export function getEvents() {
    return mockEvents;
}

export function getEvent(id: string) {
    const event = mockEvents.find(event => event.id == id);
    return event ? event : undefined;
}

const mockResponses = [
    {
        user: {
            id: 'd0f7d07c-88a6-449d-afab-78343c19227c',
            username: 'lisa',
            firstname: 'Lisa',
        },
        status: 'accepted'
    },
    {
        user: {
            id: '7c813ca2-a895-4349-a36f-a4317cee6dcf',
            username: 'helen',
            firstname: 'Helen',
        },
        status: 'declined'
    },
    {
        user: {
            id: 'a8962fc5-b1b4-4ac5-b1e4-c7665efcf931',
            username: 'maurice',
            firstname: 'Maurice',
        },
        status: 'pending'
    }
];

const mockEvents = [
    {
        id: '5bdf37dd-1e09-4bd0-b05a-922af40d20c4',
        startTime: '2023-12-10T20:00:00.000Z',
        endTime: '2020-12-10T22:00:00.000Z',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses
    },
    {
        id: '39bec6b8-b208-4530-bb68-b9b313b1f1d4',
        startTime: '2023-12-12T19:00:00.000Z',
        endTime: '2020-12-12T21:00:00.000Z',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses
    },
    {
        id: 'a8cf228c-d916-4945-ba3b-97b6de846cb6',
        startTime: '2023-12-16T18:00:00.000Z',
        endTime: '2020-12-16T21:00:00.000Z',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses
    },
    {
        id: '7cf8d165-0499-4aab-a429-694ff63b639b',
        startTime: '2023-12-17T20:00:00.000Z',
        endTime: '2020-12-17T22:00:00.000Z',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses
    },
    {
        id: 'a4317109-081e-4a5d-89f6-970a2e386f5b',
        startTime: '2023-12-19T19:00:00.000Z',
        endTime: '2020-12-19T21:00:00.000Z',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses
    },
    {
        id: '944c3000-dde8-4259-9720-aa2abdea3472',
        startTime: '2023-12-20T18:00:00.000Z',
        endTime: '2020-12-24T21:00:00.000Z',
        title: 'Christmas Market',
        description: 'Christmas Market in the city center',
        responses: mockResponses
    },
    {
        id: '9e7407bc-2459-45e5-a712-1a73d75d7746',
        startTime: '2023-12-23T18:00:00.000Z',
        endTime: '2020-12-23T21:00:00.000Z',
        title: 'Training',
        description: 'Regular training',
        responses: mockResponses
    },
]