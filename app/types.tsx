export interface Token {
    accessToken: string;
    tokenType: string;
}

export interface User {
    id: string;
    username: string;
    firstname: string;
    language: string;
}

export interface EventResponse {
    user: User;
    status: string;
}

export interface Event {
    id: string;
    startTime: string;
    endTime: string;
    title: string;
    description: string;
    responses: EventResponse[];
}

export interface AgendaEvent {
    hour: string;
    duration: string;
    title: string;
}

export interface AgendaSection {
    title: string;
    data: AgendaEvent[];
}