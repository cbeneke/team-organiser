export interface Event {
    id: number;
    title: string;
    description: string | null;
    start_time: string; // ISO format datetime
    end_time: string; // ISO format datetime
    lock_time: string; // ISO format datetime
    series_id?: number; // Optional series ID for recurring events
}