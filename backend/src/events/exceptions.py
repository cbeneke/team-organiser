from fastapi import HTTPException, status

EventNotFound = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Event not found",
)

EventDatesInvalid = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Event Start Date must be before End Date",
)
