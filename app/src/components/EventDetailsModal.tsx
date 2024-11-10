import React, { useState } from 'react';
import './EventModal.css';
import { Event } from '../types/Event';

interface EventDetailsModalProps {
    event: Event;
    onClose: () => void;
    onSave: (event: Event, title: string, description: string, startTime: string, endTime: string) => Promise<void>;
    onDelete: (event: Event) => Promise<void>;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onSave, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(event.title);
    const [description, setDescription] = useState(event.description || '');
    const [startTime, setStartTime] = useState(
        new Date(event.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    );
    const [endTime, setEndTime] = useState(
        new Date(event.end_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    );
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLocked = new Date(event.lock_time) <= new Date();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Bitte geben Sie einen Titel ein');
            return;
        }

        if (!description.trim()) {
            setError('Bitte geben Sie eine Beschreibung ein');
            return;
        }

        if (startTime >= endTime) {
            setError('Die Startzeit muss vor der Endzeit liegen');
            return;
        }

        setSaving(true);
        try {
            await onSave(event, title, description, startTime, endTime);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Möchten Sie diesen Termin wirklich löschen?')) {
            return;
        }

        setDeleting(true);
        try {
            await onDelete(event);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {isEditing ? (
                    <>
                        <h2>Termin bearbeiten</h2>
                        {error && <div className="modal-error">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Titel</label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={saving || isLocked}
                                />
                            </div>
                            <div className="form-time-group">
                                <div className="form-group">
                                    <label htmlFor="startTime">Startzeit</label>
                                    <input
                                        id="startTime"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        disabled={saving || isLocked}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="endTime">Endzeit</label>
                                    <input
                                        id="endTime"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        disabled={saving || isLocked}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Beschreibung</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={saving || isLocked}
                                />
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)}
                                    className="button-secondary"
                                    disabled={saving}
                                >
                                    Abbrechen
                                </button>
                                <button 
                                    type="submit" 
                                    className="button-primary"
                                    disabled={saving || isLocked}
                                >
                                    {saving ? 'Speichern...' : 'Speichern'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h2>{event.title}</h2>
                        {error && <div className="modal-error">{error}</div>}
                        <div className="event-details">
                            <div className="detail-group">
                                <label>Zeit</label>
                                <p>
                                    {new Date(event.start_time).toLocaleTimeString('de-DE', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })} - {new Date(event.end_time).toLocaleTimeString('de-DE', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </p>
                            </div>
                            <div className="detail-group">
                                <label>Beschreibung</label>
                                <p>{event.description}</p>
                            </div>
                            {isLocked && (
                                <div className="locked-notice">
                                    Dieser Termin ist gesperrt und kann nicht mehr bearbeitet werden.
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="button-secondary"
                            >
                                Schließen
                            </button>
                            {!isLocked && (
                                <>
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="button-secondary"
                                    >
                                        Bearbeiten
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleDelete}
                                        className="button-danger"
                                        disabled={deleting}
                                    >
                                        {deleting ? 'Löschen...' : 'Löschen'}
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}; 