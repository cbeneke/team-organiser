import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { de } from 'date-fns/locale';
import "./Calendar.css";
import { Event } from "../types/Event";
import { EventModal } from '../components/EventModal';
import { EventDetailsModal } from '../components/EventDetailsModal';

const API_URL = import.meta.env.API_URL || 'http://localhost:8000';

export const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    useEffect(() => {
        fetchEvents();
    }, [currentDate]); // Refetch when month changes

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Nicht authentifiziert');
            }

            const response = await fetch(`${API_URL}/events/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Fehler beim Laden der Termine');
            }

            const data = await response.json();
            setEvents(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get events for a specific date
    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.start_time);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const handlePreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    // German weekday names
    const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

    const handleCreateEvent = async (
        title: string, 
        description: string, 
        startTime: string, 
        endTime: string,
        recurrence: string
    ) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('Nicht authentifiziert');
        }

        if (!selectedDate) return;
        
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const startDateTime = new Date(Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            startHours,
            startMinutes,
            0
        ));
        
        const endDateTime = new Date(Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            endHours,
            endMinutes,
            0
        ));
        
        const lockDateTime = new Date(startDateTime.getTime());
        lockDateTime.setUTCHours(lockDateTime.getUTCHours() - 2);

        const response = await fetch(`${API_URL}/events/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description: description || null,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                lock_time: lockDateTime.toISOString(),
                recurrence: recurrence,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'Fehler beim Erstellen des Termins');
        }

        await fetchEvents();
    };

    const handleUpdateEvent = async (
        event: Event,
        title: string,
        description: string,
        startTime: string,
        endTime: string
    ) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('Nicht authentifiziert');
        }

        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const originalDate = new Date(event.start_time);
        
        const startDateTime = new Date(Date.UTC(
            originalDate.getUTCFullYear(),
            originalDate.getUTCMonth(),
            originalDate.getUTCDate(),
            startHours,
            startMinutes,
            0
        ));
        
        const endDateTime = new Date(Date.UTC(
            originalDate.getUTCFullYear(),
            originalDate.getUTCMonth(),
            originalDate.getUTCDate(),
            endHours,
            endMinutes,
            0
        ));

        const response = await fetch(`${API_URL}/events/${event.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'Fehler beim Aktualisieren des Termins');
        }

        await fetchEvents();
    };

    const handleDeleteEvent = async (event: Event, deleteAll: boolean = false) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('Nicht authentifiziert');
        }

        const queryParams = event.series_id && deleteAll ? '?update_all=true' : '';
        const response = await fetch(`${API_URL}/events/${event.id}${queryParams}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'Fehler beim Löschen des Termins');
        }

        await fetchEvents();
    };

    const renderWeeks = () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const weeks = [];
        let days = [];
        let currentDay = startOfMonth;

        while (currentDay.getDay() !== 1) {
            currentDay = new Date(currentDay.setDate(currentDay.getDate() - 1));
        }

        while (currentDay <= endOfMonth || currentDay.getDay() !== 1) {
            for (let i = 0; i < 7; i++) {
                const isCurrentMonth = currentDay.getMonth() === currentDate.getMonth();
                const isToday = currentDay.toDateString() === new Date().toDateString();
                const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 6;
                const dayEvents = getEventsForDate(currentDay);
                const displayEvents = dayEvents.slice(0, 3);
                const remainingEvents = dayEvents.length - 3;
                const selectedDate = new Date(currentDay);
                
                days.push(
                    <div 
                        key={currentDay.toDateString()} 
                        className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} 
                                  ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
                        onClick={() => {
                            setSelectedDate(selectedDate);
                        }}
                    >
                        <span className="day-number">{currentDay.getDate()}</span>
                        <div className="event-container">
                            {displayEvents.map(event => {
                                const isLocked = new Date(event.lock_time) <= new Date();
                                const startTime = new Date(event.start_time);
                                return (
                                    <div 
                                        key={event.id} 
                                        className={`event-indicator ${isLocked ? 'locked' : ''}`}
                                        title={`${event.title} (${startTime.toLocaleTimeString('de-DE', { 
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })})${isLocked ? ' (Gesperrt)' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedEvent(event);
                                        }}
                                    >
                                        {startTime.toLocaleTimeString('de-DE', { 
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} {event.title}
                                    </div>
                                );
                            })}
                            {remainingEvents > 0 && (
                                <div className="more-events">
                                    +{remainingEvents} weitere
                                </div>
                            )}
                        </div>
                    </div>
                );
                currentDay = new Date(currentDay.setDate(currentDay.getDate() + 1));
            }
            weeks.push(<div key={currentDay.toDateString()} className="calendar-week">{days}</div>);
            days = [];
        }
        return weeks;
    };

    return (
        <div className="calendar-container">
            {error && <div className="error-message">{error}</div>}
            <div className="calendar-header">
                <button className="nav-button" onClick={handlePreviousMonth}>
                    <span className="arrow">←</span>
                </button>
                <h2 className="current-month">
                    {format(currentDate, "MMMM yyyy", { locale: de })}
                </h2>
                <button className="nav-button" onClick={handleNextMonth}>
                    <span className="arrow">→</span>
                </button>
            </div>
            <div className="calendar-grid">
                <div className="weekdays-header">
                    {weekDays.map(day => (
                        <div key={day} className="weekday">{day}</div>
                    ))}
                </div>
                <div className="calendar-body">
                    {loading ? (
                        <div className="loading">Lädt...</div>
                    ) : (
                        renderWeeks()
                    )}
                </div>
            </div>
            
            {selectedDate && (
                <EventModal
                    date={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    onSave={handleCreateEvent}
                />
            )}
            {selectedEvent && (
                <EventDetailsModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onSave={handleUpdateEvent}
                    onDelete={handleDeleteEvent}
                />
            )}
        </div>
    );
};