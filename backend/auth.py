import re
from sqlalchemy.orm import Session
from models import Admin, User
from services import get_admin_by_email, get_user_by_email


def derive_name_from_email(email: str) -> str:
    user_part = email.split("@")[0]
    parts = re.split(r"[._-]", user_part)
    name = " ".join(p.capitalize() for p in parts if p and not p.isdigit())
    return name if name else "Admin"


def login_or_register_user(email: str, db: Session):
    cleaned_email = email.strip().lower()

    # 1. Check if email already exists in admins table
    admin = get_admin_by_email(db, cleaned_email)
    if admin:
        return {
            "success": True,
            "name": admin.name,
            "email": admin.login_email,
            "is_new": False,
            "message": "Welcome back! Logged in successfully."
        }

    # 2. Check if email exists in users table
    user = get_user_by_email(db, cleaned_email)
    if user:
        return {
            "success": True,
            "name": user.name or "User",
            "email": user.email,
            "is_new": False,
            "message": "Welcome back! Logged in successfully."
        }

    # 3. Not in DB: Store email directly in the database
    derived_name = derive_name_from_email(cleaned_email)
    new_admin = Admin(name=derived_name, login_email=cleaned_email)
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {
        "success": True,
        "name": new_admin.name,
        "email": new_admin.login_email,
        "is_new": True,
        "message": f"Email '{cleaned_email}' saved to database! Logged in successfully."
    }
