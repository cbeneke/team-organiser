export function getMeUser() {
    return mockCurrentUser;
}

export function getUser(id: string) {
    const user = mockUsers.find(user => user.id == id);
    return user ? user : undefined;
}

export function getUsers() {
    return mockUsers;
}

const mockUsers = [
    {
        id: 'd0f7d07c-88a6-449d-afab-78343c19227c',
        username: 'lisa',
        firstname: 'Lisa',
    },
    {
        id: '7c813ca2-a895-4349-a36f-a4317cee6dcf',
        username: 'helen',
        firstname: 'Helen',
    },
    {
        id: 'a8962fc5-b1b4-4ac5-b1e4-c7665efcf931',
        username: 'maurice',
        firstname: 'Maurice',
    },
]

const mockCurrentUser = mockUsers[0]