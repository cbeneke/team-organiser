export interface Token {
    access_token: string;
    token_type: string;
}

export interface User {
    id: string;
    username: string;
    display_name: string;
    language: string;
}

export interface UpdateUser {
    display_name?: string | undefined;
    password?: string | undefined;
    is_admin?: boolean | undefined;
}

export interface EventResponse {
    user: User;
    status: string;
}

export interface NewEvent {
    start_time: string;
    end_time: string;
    title: string;
    description: string;
    invitees: string[];
    display_color: string;
    recurrence: string;
}

export interface Event {
    id: string;
    start_time: string;
    end_time: string;
    title: string;
    description: string;
    responses: EventResponse[];
}

export interface UpdateEvent {
    start_time?: string | undefined;
    end_time?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    invitees?: string[] | undefined;
    display_color?: string | undefined;
    update_all: boolean;
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