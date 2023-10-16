from fastapi import HTTPException, status

UsernameAlreadyInUse = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Username already in use",
    headers={"WWW-Authenticate": "Bearer"},
)

UserInactive = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Inactive user",
    headers={"WWW-Authenticate": "Bearer"},
)

UserNotFound = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="User not found",
)

AccessDenied = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Access denied",
)