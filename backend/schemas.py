from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional


class UserCreate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=100)
    email: EmailStr
    phone: str
    city: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        if value is not None and not value.replace(" ", "").isalpha():
            raise ValueError("Name must contain only letters")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        cleaned = value.strip().lstrip("+").replace(" ", "").replace("-", "")
        if not cleaned.isdigit():
            raise ValueError("Phone must contain only digits (optional leading +)")

        if len(cleaned) < 5 or len(cleaned) > 15:
            raise ValueError("Phone must be between 5 and 15 digits")

        return value


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    city: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        if value is not None and not value.replace(" ", "").isalpha():
            raise ValueError("Name must contain only letters")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if value is not None:
            cleaned = value.strip().lstrip("+").replace(" ", "").replace("-", "")
            if not cleaned.isdigit():
                raise ValueError("Phone must contain only digits (optional leading +)")

            if len(cleaned) < 5 or len(cleaned) > 15:
                raise ValueError("Phone must be between 5 and 15 digits")

        return value


class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: Optional[EmailStr] = None
    login_email: Optional[EmailStr] = None

    def get_email(self) -> str:
        val = self.email or self.login_email
        if not val:
            raise ValueError("Email is required")
        return str(val)


class ChatMessage(BaseModel):
    message: str
    sender_email: EmailStr