from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import User

_pwd = CryptContext(schemes=["argon2"], deprecated="auto")

# This matches your /auth/login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(p: str) -> str:
    if isinstance(p, str):
        # you can either enforce:
        if len(p.encode("utf-8")) > 72:
            raise HTTPException(
                status_code=400,
                detail="Password too long; please use a password under 72 characters.",
            )
    return _pwd.hash(p)

def verify_password(p: str, h: str) -> bool:
    return _pwd.verify(p, h)

def make_token(sub: str, ttl_seconds: int, extra: dict) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": sub,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=ttl_seconds)).timestamp()),
        **extra,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def parse_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALG],
        )
    except JWTError:
        return None
    
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    data = parse_token(token)
    if not data or data.get("scope") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).get(int(data["sub"]))
    if not user or not user.is_active or data.get("ver") != user.token_version:
        raise HTTPException(status_code=401, detail="Not authorized")

    return user
