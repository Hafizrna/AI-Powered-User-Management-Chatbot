from sqlalchemy.orm import Session
from sqlalchemy import func
from models import User, Admin
from schemas import UserCreate, UserUpdate


# ADMIN SERVICES
def get_admin_by_email(db: Session, login_email: str):
    return db.query(Admin).filter(func.lower(Admin.login_email) == login_email.strip().lower()).first()


def create_admin(db: Session, name: str, login_email: str):
    admin = Admin(name=name, login_email=login_email.strip().lower())
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


# CREATE
def create_user(db: Session, user: UserCreate):
    db_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        city=user.city
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# READ - Get user by email
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(func.lower(User.email) == email.strip().lower()).first()


# READ - Get user by name (case-insensitive)
def get_user_by_name(db: Session, name: str):
    return db.query(User).filter(func.lower(User.name) == name.strip().lower()).first()


# READ - Get user by phone
def get_user_by_phone(db: Session, phone: str):
    raw = phone.strip()
    digits = "".join(c for c in raw if c.isdigit())

    # 1. Exact match
    u = db.query(User).filter(User.phone == raw).first()
    if u:
        return u

    # 2. Normalized digits match (e.g. 0341... matching +92341...)
    if len(digits) >= 5:
        all_users = db.query(User).all()
        for user in all_users:
            if user.phone:
                u_digits = "".join(c for c in user.phone if c.isdigit())
                if u_digits == digits or u_digits.endswith(digits) or digits.endswith(u_digits):
                    return user
    return None


# READ - Flexible finder by field or auto-detect
def find_user_flexible(db: Session, field: str = None, value: str = None):
    if not value:
        return None
    val = value.strip()

    if field:
        f = field.lower()
        if f == "email":
            return get_user_by_email(db, val)
        elif f == "phone":
            return get_user_by_phone(db, val)
        elif f == "name":
            u = get_user_by_name(db, val)
            if not u and val.lower().endswith("s"):
                u = get_user_by_name(db, val[:-1])
            return u

    # Auto-detect when field is not strictly provided
    if "@" in val:
        return get_user_by_email(db, val)

    digits = "".join(c for c in val if c.isdigit())
    if len(digits) >= 6:
        u = get_user_by_phone(db, val)
        if u:
            return u

    u = get_user_by_name(db, val)
    if not u and val.lower().endswith("s"):
        u = get_user_by_name(db, val[:-1])
    if u:
        return u

    return get_user_by_email(db, val) or get_user_by_phone(db, val)


# READ - Get all users
def get_all_users(db: Session):
    return db.query(User).all()


# UPDATE - Update user by email
def update_user(db: Session, email: str, user: UserUpdate):
    db_user = get_user_by_email(db, email)

    if not db_user:
        return None

    update_data = user.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    return db_user


# UPDATE - Update a specific field on a user directly
def update_user_field(db: Session, db_user: User, field: str, new_value: str):
    f = field.strip().lower()
    if hasattr(db_user, f):
        setattr(db_user, f, new_value)
        db.commit()
        db.refresh(db_user)
        return db_user
    return None


# UPDATE - Update user by name
def update_user_by_name(db: Session, name: str, user: UserUpdate):
    db_user = get_user_by_name(db, name)

    if not db_user:
        return None

    update_data = user.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    return db_user


# DELETE - Delete user by email
def delete_user(db: Session, email: str):
    db_user = get_user_by_email(db, email)

    if not db_user:
        return None

    db.delete(db_user)
    db.commit()

    return db_user
