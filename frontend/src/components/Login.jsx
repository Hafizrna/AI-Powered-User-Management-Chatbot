import React, { useState } from "react";
import { Mail, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import BotLogo from "./BotLogo";

const API_BASE_URL = "http://localhost:8000";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          login_email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.message || "Failed to log in");
      }

      onLoginSuccess({
        name: data.name,
        email: data.email,
        isNew: data.is_new,
      });
    } catch (err) {
      setError(err.message || "Could not connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        width: "100%",
        maxWidth: "460px",
        background: "#ffffff",
        border: "1px solid #fed7aa",
        borderRadius: "24px",
        padding: "38px 34px",
        boxShadow: "0 20px 40px rgba(251, 146, 60, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)",
        textAlign: "center",
      }}
    >
      {/* Icon Badge */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <BotLogo size={36} containerSize={68} borderRadius={20} />
      </div>

      <h1
        style={{
          fontSize: "26px",
          fontWeight: 700,
          color: "#1e293b",
          marginBottom: "8px",
          letterSpacing: "-0.5px",
        }}
      >
        Admin Chatbot
      </h1>

      <p
        style={{
          fontSize: "14px",
          color: "#64748b",
          marginBottom: "24px",
          lineHeight: "1.5",
        }}
      >
        Welcome! Enter your email to get started.
      </p>

      {/* Auto Login Feature Box */}
      <div
        style={{
          background: "#fff7ed",
          border: "1px solid #ffedd5",
          borderRadius: "14px",
          padding: "12px 16px",
          marginBottom: "22px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          fontSize: "12px",
          color: "#475569",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={15} color="#ea580c" />
          <span><strong>First time:</strong> Your email is saved directly into the database.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={15} color="#f97316" />
          <span><strong>Next time:</strong> You are auto-logged in without re-entering email!</span>
        </div>
      </div>

      {error && (
        <div
          className="animate-fade-in"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "10px 14px",
            borderRadius: "12px",
            fontSize: "13px",
            marginBottom: "20px",
            textAlign: "left",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ position: "relative", textAlign: "left" }}>
          <label
            htmlFor="user-email"
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#475569",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Your Email
          </label>
          <div style={{ position: "relative" }}>
            <Mail
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              id="user-email"
              type="email"
              placeholder="e.g. john@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                background: "#fffdfa",
                border: "1px solid #fed7aa",
                borderRadius: "12px",
                color: "#1e293b",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#f97316";
                e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#fed7aa";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 8px 20px rgba(249, 115, 22, 0.28)",
            transition: "transform 0.15s, opacity 0.2s",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseDown={(e) => !loading && (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => !loading && (e.currentTarget.style.transform = "scale(1)")}
        >
          {loading ? "Connecting..." : "Enter Chatbot"}
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
