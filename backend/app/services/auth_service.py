from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from app.config import settings
from app.exceptions import EmailAlreadyExistsError, UsernameAlreadyExistsError
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserRegister, TokenResponse, UserResponse


class AuthService:
    def __init__(self, repo: UserRepository):
        self._repo = repo

    def _hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def _verify_password(self, password: str, hashed: str) -> bool:
        return bcrypt.checkpw(password.encode(), hashed.encode())

    def _create_token(self, user_id: int) -> str:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        payload = {"sub": str(user_id), "exp": expire}
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    async def register(self, data: UserRegister) -> UserResponse:
        if await self._repo.get_by_email(data.email):
            raise EmailAlreadyExistsError()
        if await self._repo.get_by_username(data.username):
            raise UsernameAlreadyExistsError()

        hashed = self._hash_password(data.password)
        user = await self._repo.create(data.email, data.username, hashed)
        return UserResponse.model_validate(user)

    async def login(self, email: str, password: str) -> TokenResponse | None:
        user = await self._repo.get_by_email(email)
        if not user or not self._verify_password(password, user.hashed_password):
            return None
        token = self._create_token(user.id)
        return TokenResponse(access_token=token)
