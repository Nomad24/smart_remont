from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.exceptions import EmailAlreadyExistsError, UsernameAlreadyExistsError
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _get_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


@router.post("/register/", response_model=UserResponse, status_code=201, summary="Регистрация")
async def register(
    data: UserRegister,
    service: AuthService = Depends(_get_service),
):
    try:
        return await service.register(data)
    except EmailAlreadyExistsError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email уже занят")
    except UsernameAlreadyExistsError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Имя пользователя уже занято")


@router.post("/login/", response_model=TokenResponse, summary="Вход")
async def login(
    data: UserLogin,
    service: AuthService = Depends(_get_service),
):
    token = await service.login(data.email, data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )
    return token


@router.get("/me/", response_model=UserResponse, summary="Текущий пользователь")
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
