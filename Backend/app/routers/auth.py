from fastapi import APIRouter, HTTPException
from app.schemas.user import UserOut, UserLogin, UserSignUp, ChangePassword, ForgotPassword, ResetPassword, VerifyEmail
from app.services import auth_service
from fastapi import Depends
from app.dependencies import get_current_user
from app.services.rate_limit_service import ip_rate_limit, enforce_rate_limit


router = APIRouter()


@router.post("/signup", response_model=UserOut, dependencies=[Depends(ip_rate_limit("signup", 5, 3600))])
async def signup(user: UserSignUp):
    try:
        return await auth_service.create_user(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", dependencies=[Depends(ip_rate_limit("login", 10, 900))])
async def login(credentials: UserLogin):
    try:
        result = await auth_service.authenticate_user(credentials)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

    if result is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth_service.create_access_token({"sub": result.email})

    return {"access_token": token, "token_type": "bearer"}


@router.get("/me",response_model=UserOut)
async def me(current_user:UserOut=Depends(get_current_user)):
    return current_user



@router.put("/change-password")
async def change_password_route(data: ChangePassword, current_user: UserOut = Depends(get_current_user)):
    try:
        await auth_service.change_password(current_user.email, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Password Changed Successfully"}

@router.post("/forgot-password", dependencies=[Depends(ip_rate_limit("forgot-password", 3, 3600))])
async def forgot_password_route(data: ForgotPassword):
    try:
        token = await auth_service.forgot_password(data.email)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {"message": "Reset token generated", "reset_token": token}


@router.post("/reset-password")
async def reset_password_route(data: ResetPassword):
    try:
        await auth_service.reset_password(data.token, data.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Password reset successful"}


@router.post("/verify-email")
async def verify_email_route(data: VerifyEmail):
    try:
        await auth_service.verify_email(data.token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification_route(current_user: UserOut = Depends(get_current_user)):
    await enforce_rate_limit(f"resend-verification:{current_user.id}", max_requests=3, window_seconds=3600)
    try:
        await auth_service.resend_verification(current_user.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Verification email sent"}