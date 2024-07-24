from fastapi import HTTPException, status

EventNotFound = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Event not found",
)

EventDatesInvalid = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Event Start Time must be before End Time",
)

EventResponseNotFound = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="User not invited to event",
)

EventTitleInvalid = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Event Title cannot be empty",
)

EventIsLocked = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Event is locked",
)

EventLockedTimeInvalid = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Event Lock Time must be before Start Time",
)
