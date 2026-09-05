import os
import json
import re
import warnings
from typing import Dict, Any
from dotenv import load_dotenv

warnings.filterwarnings("ignore")

# Load environment variables from .env file
load_dotenv()

SYSTEM_PROMPT = """You are an intelligent entity extraction and database command parser for an admin user management chatbot.
The database contains a 'users' table with columns: id, name, email, phone, city.

You must handle ANY natural language command, whether phrased colloquially, grammatically imperfect, like a SQL clause, or incomplete.
Examples of phrasings you must support:
- "update the phone number where the email is john@xyz.com to +92332111"
- "update the name where the email is ali@xyz.com to Ali Khan"
- "i want to change the name where the email is sam@xyz.com to Samantha"
- "update the phone number 03416875631 to 03237067800"
- "can you update the 03416875631 to 03237067800"
- "i want to update the phone number of ali" (missing new phone value!)
- "update samanthas city to Cordoba"
- "can you add user john.smith@xyz.com phone +92332"
- "delete user where email is john@xyz.com"
- "remove ali from database"
- "show all users" / "list users"

Your response must be ONLY a valid JSON object matching this schema:
{
  "intent": "ADD_USER" | "DELETE_USER" | "UPDATE_USER" | "LIST_USERS" | "UNKNOWN",

  "name": string or null,
  "email": string or null,
  "phone": string or null,
  "city": string or null,

  "where_field": "email" | "name" | "phone" | "city" | null,
  "where_value": string or null,
  "update_field": "phone" | "name" | "city" | "email" | null,
  "new_value": string or null,

  "delete_field": "email" | "name" | "phone" | null,
  "delete_value": string or null,

  "is_incomplete": boolean,
  "ask_user_message": string or null
}

Guidelines:
1. For "update the phone number where the email is X to Y":
   where_field="email", where_value="X", update_field="phone", new_value="Y", is_incomplete=false.
2. For "update the phone number 03416875631 to 03237067800":
   where_field="phone", where_value="03416875631", update_field="phone", new_value="03237067800", is_incomplete=false.
3. For "can you update the '03416875631' to '03237067800'":
   where_field="phone", where_value="03416875631", update_field="phone", new_value="03237067800", is_incomplete=false.
4. For "i want to update the phone number of ali" (no new phone provided):
   where_field="name", where_value="ali", update_field="phone", new_value=null, is_incomplete=true, ask_user_message="Sure! What is the new phone number you would like to set for Ali?".
5. For "update samanthas city to Cordoba":
   where_field="name", where_value="samantha", update_field="city", new_value="Cordoba", is_incomplete=false.
"""

def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """Strip markdown code fences and parse JSON."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n", "", text)
        text = re.sub(r"\n```$", "", text)
    return json.loads(text.strip())


def parse_with_groq(api_key: str, user_message: str) -> Dict[str, Any]:
    from groq import Groq
    client = Groq(api_key=api_key)
    
    for model_name in ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                response_format={"type": "json_object"},
                max_tokens=400,
                temperature=0.1
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            last_err = e
            continue
    raise last_err


def parse_with_gemini(api_key: str, user_message: str) -> Dict[str, Any]:
    import google.generativeai as genai
    genai.configure(api_key=api_key)

    for model_name in ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-flash-latest"]:
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config={"response_mime_type": "application/json"}
            )
            prompt = f"{SYSTEM_PROMPT}\n\nUser command: {user_message}"
            response = model.generate_content(prompt)
            return clean_json_response(response.text)
        except Exception as e:
            last_err = e
            continue
    raise last_err


def parse_command_llm(user_message: str) -> Dict[str, Any]:
    """Parse user command using Groq or Gemini based on LLM_PROVIDER setting with automatic fallback."""
    provider = os.getenv("LLM_PROVIDER", "groq").strip().lower()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    groq_key = os.getenv("GROQ_API_KEY", "").strip()

    # If Groq is primary
    if provider == "groq":
        if groq_key and not groq_key.startswith("your_"):
            try:
                res = parse_with_groq(groq_key, user_message)
                res["provider"] = "Groq"
                return res
            except Exception as e:
                print(f"[Groq error, attempting Gemini fallback]: {e}")

        if gemini_key and not gemini_key.startswith("your_"):
            try:
                res = parse_with_gemini(gemini_key, user_message)
                res["provider"] = "Gemini"
                return res
            except Exception as e:
                print(f"[Gemini fallback error]: {e}")

    # If Gemini is primary
    else:
        if gemini_key and not gemini_key.startswith("your_"):
            try:
                res = parse_with_gemini(gemini_key, user_message)
                res["provider"] = "Gemini"
                return res
            except Exception as e:
                print(f"[Gemini error, attempting Groq fallback]: {e}")

        if groq_key and not groq_key.startswith("your_"):
            try:
                res = parse_with_groq(groq_key, user_message)
                res["provider"] = "Groq"
                return res
            except Exception as e:
                print(f"[Groq fallback error]: {e}")

    return {
        "intent": "NO_API_KEY",
        "error": "No active LLM API key configured in backend/.env"
    }
