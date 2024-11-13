import React from 'react';
import './EventModal.css';
import { Event } from '../types/Event';

interface DeleteConfirmationModalProps {
    event: Event;
    onClose: () => void;
    onConfirm: (deleteAll: boolean) => Promise<void>;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
    event, 
    onClose, 
    onConfirm 
}) => {
    const [deleting, setDeleting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleDelete = async (deleteAll: boolean) => {
        setDeleting(true);
        try {
            await onConfirm(deleteAll);
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
                <h2>Termin löschen</h2>
                {error && <div className="modal-error">{error}</div>}
                <p>Möchten Sie diesen Termin wirklich löschen?</p>
                <p><strong>{event.title}</strong></p>
                <p>{new Date(event.start_time).toLocaleDateString('de-DE')} {new Date(event.start_time).toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</p>
                
                <div className="modal-actions">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="button-secondary"
                        disabled={deleting}
                    >
                        Abbrechen
                    </button>
                    {event.series_id ? (
                        <>
                            <button 
                                type="button"
                                onClick={() => handleDelete(false)}
                                className="button-danger"
                                disabled={deleting}
                            >
                                {deleting ? 'Löschen...' : 'Diesen Termin löschen'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => handleDelete(true)}
                                className="button-danger"
                                disabled={deleting}
                            >
                                {deleting ? 'Löschen...' : 'Alle Termine löschen'}
                            </button>
                        </>
                    ) : (
                        <button 
                            type="button"
                            onClick={() => handleDelete(false)}
                            className="button-danger"
                            disabled={deleting}
                        >
                            {deleting ? 'Löschen...' : 'Löschen'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}; 