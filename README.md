# 🤖 Admin User Management Chatbot

A simple and fast AI-powered admin chatbot for managing users through natural language commands.

The application allows administrators to **add, update, delete, and manage user information** using simple chat commands.
# 🎥 Demo

**Project Demo Video:**
[GOOGLE_DRIVE_LINK_HER](https://drive.google.com/file/d/1yFFJNJsychamP4_JExdqie_M33RwHcbH/view?usp=drive_link)

---

## 🚀 Tech Stack

* **Frontend:** React + Vite
* **Backend:** FastAPI
* **Database:** PostgreSQL
* **LLM:** Groq / Google Gemini
* **ORM:** SQLAlchemy

---

# 📋 Features

*  Simple email-based login
*  Natural language chatbot interface
*  Add users through chat commands
*  Update user information through chat commands
*  Delete users through chat commands
*  PostgreSQL database integration
*  Automatic login using browser localStorage
*  LLM provider fallback between Groq and Gemini

### Example Commands

```text
Add the user john.smith@xyz.com with phone number +92332

Remove the user john.smith@xyz.com

Update Samantha's city to Cordoba
```

---

# 🚀 How to Run the Project

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

---

# 🗄️ 2. PostgreSQL Database Setup

The project uses a **local PostgreSQL database**.

Before starting the backend, create a PostgreSQL database with the following name:

```text
chatbot_db
```

### Create Database

You can create it using **pgAdmin** or the PostgreSQL terminal:

```sql
CREATE DATABASE chatbot_db;
```

### Configure Database Connection

After creating the database:

1. Open:

```text
backend/db.py
```

2. Find the PostgreSQL database URL.

3. Update the connection string with **your local PostgreSQL username, password, host, port, and database name**.

For example:

```python
DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/chatbot_db"
```

Replace:

```text
YOUR_PASSWORD
```

with your own PostgreSQL password.

> **Note:** PostgreSQL is configured locally for this project, so the database connection must be updated with the credentials of the system where the project is being run.

---

# 🔑 3. Configure LLM API Keys

Create a `.env` file inside the `backend` folder:

```text
backend/.env
```

Add your own API keys:

```env
LLM_PROVIDER=groq

GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### LLM Provider

The application supports:

```env
LLM_PROVIDER=groq
```

or

```env
LLM_PROVIDER=gemini
```

The application also includes an automatic fallback mechanism so that if the primary provider encounters an issue such as rate limits or network problems, it can switch to the other configured provider.

> **Security:** Do not commit your `.env` file or API keys to GitHub. Make sure `.env` is included in `.gitignore`.

---

# ⚙️ 4. Start the Backend

Open a terminal and run:

```bash
cd backend
```

Activate your virtual environment:

### Windows

```bash
..\venv\Scripts\activate
```

Then start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

Backend API documentation:

```text
http://localhost:8000/docs
```

---

# 💻 5. Start the Frontend

Open a **second terminal**:

```bash
cd frontend
```

Install dependencies if required:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:5173
```

---

# 🔐 Login & Auto-Login Behavior

### First Visit

Enter an email address on the login screen.

For example:

```text
yourname@company.com
```

The system checks the email and handles the login through the backend/database.

### Auto-Login

After successful login, the user's session is stored in the browser's `localStorage`.

When the user opens the application again, they can be automatically logged in without entering their email again.

### Logout

Click the **Logout** button to clear the current session and return to the login screen.

---

# ⚠️ Important Notes for Running the Project

Because PostgreSQL is running locally on the developer's machine, the database connection is **environment-specific**.

If you run this project on another computer:

1. Install PostgreSQL.
2. Create a database named `chatbot_db`.
3. Open `backend/db.py`.
4. Update the PostgreSQL connection URL with your own credentials.
5. Configure your own Groq/Gemini API keys in `backend/.env`.
6. Start the backend.
7. Start the frontend.

Once the database and API configuration are completed, the application can be run locally.

---



# 👨‍💻 Author

**Abdul Rehman Nadeem**
