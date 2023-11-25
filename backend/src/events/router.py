from fastapi import APIRouter, Depends, Form, status
from typing import Annotated, Optional
from sqlalchemy.orm import Session
from datetime import date, datetime

from src.database import get_db

import src.events.schemas as schemas
import src.events.dependencies as dependencies
import src.events.service as service
import src.events.utils as utils

import src.users.dependencies as user_dependencies
import src.users.exceptions as user_exceptions
import src.users.schemas as user_schemas
import src.users.service as user_service

router = APIRouter()

@router.get("/", response_model=list[schemas.ResponseEvent])
async def get_events(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    user: user_schemas.ResponseUser = Depends(user_dependencies.get_current_active_user),
    db: Session = Depends(get_db),
):
    start_time, end_time = utils.parse_timerange(start_date, end_date)

    events = service.get_events(start_time, end_time, db)
    return events

@router.post("/", response_model=schemas.ResponseEvent, status_code=status.HTTP_201_CREATED)
async def add_event(
    event: schemas.NewEvent,
    user: user_schemas.ResponseUser = Depends(user_dependencies.get_current_active_user),
    db: Session = Depends(get_db),
):

    event = service.add_event(event, user, db)
    return event

@router.get("/{event_id}", response_model=schemas.ResponseEvent)
async def router_get_event(
    user: user_schemas.ResponseUser = Depends(user_dependencies.get_current_active_user),
    event: schemas.ResponseEvent = Depends(dependencies.get_event),
):
    return event

@router.delete("/{event_id}")
async def router_delete_event(
    event: schemas.ResponseEvent = Depends(dependencies.get_event),
    user: user_schemas.ResponseUser = Depends(user_dependencies.get_current_active_user),
    db: Session = Depends(get_db),
):
    if not user_service.is_owner_or_admin(user, event.owner, db):
        raise user_exceptions.AccessDenied
    
    db.delete(event)
    db.commit()

    return {}

@router.put("/{event_id}", response_model=schemas.ResponseEvent)
async def router_update_event(
    title: Optional[str] = None,
    description: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    event: schemas.ResponseEvent = Depends(dependencies.get_event),
    user: user_schemas.ResponseUser = Depends(user_dependencies.get_current_active_user),
    db: Session = Depends(get_db),
):
    if not user_service.is_owner_or_admin(user, event.owner, db):
        raise user_exceptions.AccessDenied

    event = service.update_event(db, event, title, description, start_time, end_time)
    return event
