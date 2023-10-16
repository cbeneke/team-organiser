from fastapi import HTTPException, status

InvalidTokenException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

UsernameAlreadyInUseException = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Username already in use",
    headers={"WWW-Authenticate": "Bearer"},
)

InactiveUserException = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Inactive user",
    headers={"WWW-Authenticate": "Bearer"},
)

InvalidUsernameOrPasswordException =  HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Incorrect username or password",
    headers={"WWW-Authenticate": "Bearer"},
)