from fastapi import Depends
from sqlalchemy.orm import Session
from uuid import UUID

import src.database as db

import src.events.models as models
import src.events.schemas as schemas
import src.events.exceptions as exceptions

def get_event(
    event_id: UUID,
    db: Session = Depends(db.get_db),
) -> schemas.ResponseEvent:
    event = (db
        .query(models.DBEvents)
        .get(event_id))
    
    if event is None:
        raise exceptions.EventNotFound
    
    return event