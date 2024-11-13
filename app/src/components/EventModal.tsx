import React, { useState } from 'react';
import './EventModal.css';

interface EventModalProps {
    date: Date;
    onClose: () => void;
    onSave: (title: string, description: string, startTime: string, endTime: string, recurrence: string) => Promise<void>;
}

export const EventModal: React.FC<EventModalProps> = ({ date, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('18:00');
    const [endTime, setEndTime] = useState('20:00');
    const [recurrence, setRecurrence] = useState('once');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFormValid = () => {
        return (
            title.trim() !== '' &&
            description.trim() !== '' &&
            startTime !== '' &&
            endTime !== '' &&
            recurrence !== ''
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

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

        if (!isFormValid()) {
            setError('Bitte füllen Sie alle Felder aus');
            return;
        }

        setSaving(true);
        try {
            await onSave(title, description, startTime, endTime, recurrence);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Neuer Termin am {date.toLocaleDateString('de-DE')}</h2>
                {error && <div className="modal-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Titel</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titel des Termins"
                            disabled={saving}
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
                                disabled={saving}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endTime">Endzeit</label>
                            <input
                                id="endTime"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                disabled={saving}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="recurrence">Wiederholung</label>
                        <select
                            id="recurrence"
                            value={recurrence}
                            onChange={(e) => setRecurrence(e.target.value)}
                            disabled={saving}
                        >
                            <option value="once">Einmalig</option>
                            <option value="weekly">Wöchentlich</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Beschreibung</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Beschreibung des Termins"
                            disabled={saving}
                        />
                    </div>
                    <div className="modal-actions">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="button-secondary"
                            disabled={saving}
                        >
                            Abbrechen
                        </button>
                        <button 
                            type="submit" 
                            className="button-primary"
                            disabled={saving || !isFormValid()}
                        >
                            {saving ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 