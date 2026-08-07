from fastapi import APIRouter, HTTPException
from app.schemas.user import UserOut, UserLogin, UserSignUp
from app.services import auth_service
from fastapi import Depends
from app.dependencies import get_current_user


router = APIRouter()


@router.post("/signup", response_model=UserOut)
async def signup(user: UserSignUp):
    try:
        return await auth_service.create_user(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(credentials: UserLogin):
    result = await auth_service.authenticate_user(credentials)

    if result is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth_service.create_access_token({"sub": result.email})

    return {"access_token": token, "token_type": "bearer"}


@router.get("/me",response_model=UserOut)
async def me(current_user:UserOut=Depends(get_current_user)):
    return current_user

