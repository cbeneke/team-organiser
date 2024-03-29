from fastapi import HTTPException, status

EventNotFound = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Event not found",
)

EventDatesInvalid = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Event Start Date must be before End Date",
)

EventResponseNotFound = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="User not invited to event",
)

EventTitleInvalid = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Event Title cannot be empty",
)
