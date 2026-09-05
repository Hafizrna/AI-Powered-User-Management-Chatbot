from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from db import Base, engine, get_db, SessionLocal
from schemas import (
    UserCreate,
    UserUpdate,
    UserResponse,
    LoginRequest,
    ChatMessage
)
from services import (
    create_user,
    get_user_by_email,
    get_user_by_name,
    get_user_by_phone,
    find_user_flexible,
    update_user_field,
    get_all_users,
    update_user,
    update_user_by_name,
    delete_user,
    get_admin_by_email,
    create_admin
)
from auth import login_or_register_user
from llm_parser import parse_command_llm
from models import User, Admin


app = FastAPI(title="User CRUD & Admin Chatbot API")

# Enable CORS for React frontend (Vite default port is 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)


# ---------------- AUTH / LOGIN ----------------
@app.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # If email doesn't exist, it is stored into the database automatically
    return login_or_register_user(payload.get_email(), db)



# ---------------- CHATBOT ENDPOINT ----------------
@app.post("/chat")
def chat_endpoint(payload: ChatMessage, db: Session = Depends(get_db)):
    # 1. Verify sender is a registered admin or user in the system
    sender = payload.sender_email.strip().lower()
    admin = get_admin_by_email(db, sender)
    user = get_user_by_email(db, sender)
    if not admin and not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized. Only users added in the system can interact with this chatbot."
        )

    # 2. Parse natural language command with LLM
    parsed = parse_command_llm(payload.message)
    intent = parsed.get("intent")

    if intent == "NO_API_KEY":
        return {
            "reply": "⚠️ **LLM API Key Required**: Please provide your Gemini API key or Groq API key in `backend/.env` (e.g. `GEMINI_API_KEY=...` or `GROQ_API_KEY=...`)."
        }

    # Check if incomplete command (e.g. "i want to update phone number of ali" with no new phone)
    if parsed.get("is_incomplete") and parsed.get("ask_user_message"):
        return {"reply": f"🤖 {parsed['ask_user_message']}"}

    # 3. Handle ADD_USER
    if intent == "ADD_USER":
        email = parsed.get("email")
        phone = parsed.get("phone")
        name = parsed.get("name") or "User"
        city = parsed.get("city")

        if not email:
            return {"reply": "⚠️ Please provide an email address for the new user."}

        if not phone:
            return {
                "reply": f"⚠️ I identified user '{email}', but a phone number is required. Please specify a phone number (e.g. phone +92332)."
            }

        existing = get_user_by_email(db, email)
        if existing:
            return {
                "reply": f"⚠️ User with email '{email}' already exists in the system."
            }

        try:
            user_data = UserCreate(name=name, email=email, phone=phone, city=city)
            created = create_user(db, user_data)
            city_str = f" in {created.city}" if created.city else ""
            return {
                "reply": f"✅ Successfully added user **{created.name}** ({created.email}) with phone `{created.phone}`{city_str}."
            }
        except Exception as ex:
            return {"reply": f"❌ Error adding user: {str(ex)}"}

    # 4. Handle DELETE_USER
    elif intent == "DELETE_USER":
        del_val = parsed.get("delete_value") or parsed.get("email") or parsed.get("name")
        del_field = parsed.get("delete_field")

        if not del_val:
            return {"reply": "⚠️ Please specify which user you would like to remove (by email, phone, or name)."}

        db_user = find_user_flexible(db, field=del_field, value=del_val)
        if not db_user:
            db_user = find_user_flexible(db, field=None, value=del_val)

        if db_user:
            delete_user(db, db_user.email)
            return {"reply": f"✅ User **{db_user.name}** (`{db_user.email}`) has been removed from the system."}
        else:
            return {"reply": f"❌ User with {del_field or 'identifier'} '{del_val}' was not found in the database."}

    # 5. Handle UPDATE_USER
    elif intent == "UPDATE_USER":
        where_val = parsed.get("where_value")
        where_field = parsed.get("where_field")
        update_field = parsed.get("update_field")
        new_val = parsed.get("new_value")

        if not where_val or not update_field or not new_val:
            if parsed.get("ask_user_message"):
                return {"reply": f"🤖 {parsed['ask_user_message']}"}
            return {
                "reply": "⚠️ Could not understand the update parameters. Examples you can use:\n"
                         "• `update the phone number where the email is john@xyz.com to 03237067800`\n"
                         "• `update the name where the email is ali@xyz.com to Ali Khan`\n"
                         "• `update the phone number 03416875631 to 03237067800`\n"
                         "• `update samanthas city to Cordoba`"
            }

        # Look up user flexibly by email, phone, or name
        db_user = find_user_flexible(db, field=where_field, value=where_val)
        if not db_user:
            db_user = find_user_flexible(db, field=None, value=where_val)

        if not db_user:
            return {"reply": f"❌ User with {where_field or 'identifier'} '{where_val}' was not found in the database."}

        # Update the field on the user
        try:
            update_user_field(db, db_user, update_field, new_val)
            return {
                "reply": f"✅ Successfully updated **{db_user.name}**'s {update_field} to **{new_val}** (Email: `{db_user.email}`)."
            }
        except Exception as ex:
            return {"reply": f"❌ Error updating user: {str(ex)}"}

    # 6. Handle LIST_USERS
    elif intent == "LIST_USERS":
        users = get_all_users(db)
        if not users:
            return {"reply": "ℹ️ There are currently no users registered in the database."}

        reply_lines = ["📋 **Current Users in Database:**"]
        for u in users:
            city_info = f", City: {u.city}" if u.city else ""
            reply_lines.append(f"• **{u.name}** — `{u.email}` | Phone: `{u.phone}`{city_info}")
        return {"reply": "\n".join(reply_lines)}

    # 7. UNKNOWN / HELP
    return {
        "reply": (
            "🤖 I didn't quite understand that command. Here are some examples of what I can do:\n\n"
            "• **Update by Email**: `update the phone number where the email is john@xyz.com to 03237067800`\n"
            "• **Update by Phone**: `update the phone number 03416875631 to 03237067800`\n"
            "• **Update by Name**: `update samanthas city to Cordoba`\n"
            "• **Add User**: `can you add the user \"john.smith@xyz.com\" with phone number \"+92332\"`\n"
            "• **Remove User**: `delete user where email is john@xyz.com`\n"
            "• **List Users**: `show all users`"
        )
    }



# ---------------- EXISTING REST CRUD ENDPOINTS ----------------
# CREATE USER
@app.post("/users", response_model=UserResponse)
def add_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )

    return create_user(db, user)


# GET ALL USERS
@app.get("/users", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db)
):
    return get_all_users(db)


# GET USER BY EMAIL
@app.get("/users/{email}", response_model=UserResponse)
def get_user(
    email: str,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# UPDATE USER BY EMAIL
@app.put("/users/{email}", response_model=UserResponse)
def update_user_by_email(
    email: str,
    user: UserUpdate,
    db: Session = Depends(get_db)
):
    updated_user = update_user(db, email, user)

    if not updated_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return updated_user


# DELETE USER BY EMAIL
@app.delete("/users/{email}")
def delete_user_by_email(
    email: str,
    db: Session = Depends(get_db)
):
    deleted_user = delete_user(db, email)

    if not deleted_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User deleted successfully",
        "email": email
    }
