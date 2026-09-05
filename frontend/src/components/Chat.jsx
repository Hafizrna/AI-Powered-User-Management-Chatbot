import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, LogOut, Sparkles, RefreshCw } from "lucide-react";
import MessageBubble from "./MessageBubble";
import BotLogo from "./BotLogo";

const API_BASE_URL = "http://localhost:8000";

const QUICK_COMMANDS = [
  {
    label: "➕ Add User",
    text: 'can you add the user "name@example.com" with name John, phone +923001234567, and city Lahore',
    isInstant: false,
  },
  {
    label: "✏️ Update User",
    text: 'update the phone number where the email is name@example.com to +923001234567',
    isInstant: false,
  },
  {
    label: "🗑️ Delete User",
    text: 'can you remove the user "name@example.com"',
    isInstant: false,
  },
  {
    label: "📋 List All Users",
    text: "show all users",
    isInstant: true,
  },
];

export default function Chat({ admin, onLogout }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: `👋 Hello **${admin.name || "Admin"}**!\nI am your admin assistant. You can add, update, remove, or view users through natural commands.\n\nTry commands like:\n• \`can you add the user "john.smith@xyz.com" with phone "+92332" and city Lahore\`\n• \`update the phone number where the email is john.smith@xyz.com to 03237067800\`\n• \`can you update samanthas city to Cordoba\`\n• \`show all users\``,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          sender_email: admin.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to process message");
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply || "Done!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: `⚠️ Error: ${err.message || "Could not connect to the backend server."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleQuickCommandClick = (cmd) => {
    if (cmd.isInstant) {
      sendMessage(cmd.text);
    } else {
      setInput(cmd.text);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(cmd.text.length, cmd.text.length);
        }
      }, 50);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        width: "100%",
        maxWidth: "880px",
        height: "90vh",
        maxHeight: "850px",
        background: "#ffffff",
        border: "1px solid #fed7aa",
        borderRadius: "24px",
        boxShadow: "0 20px 45px rgba(251, 146, 60, 0.1), 0 4px 12px rgba(0, 0, 0, 0.03)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top Header */}
      <header
        style={{
          padding: "16px 24px",
          background: "#ffffff",
          borderBottom: "1px solid #ffedd5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <BotLogo size={24} containerSize={44} borderRadius={14} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Admin Assistant</h2>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "#f0fdf4",
                  color: "#16a34a",
                  border: "1px solid #bbf7d0",
                }}
              >
                <span
                  className="pulse-dot"
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#16a34a",
                  }}
                />
                Live
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#64748b" }}>AI Powered (Groq & Gemini) • Ready for commands</p>
          </div>
        </div>

        {/* Right side: Admin user badge & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              padding: "6px 14px",
              borderRadius: "12px",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>{admin.name}</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>{admin.email}</div>
          </div>

          <button
            onClick={onLogout}
            title="Log out"
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "9px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fca5a5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fee2e2")}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Suggestion Chips Bar */}
      <div
        style={{
          padding: "10px 24px",
          background: "#fffbf7",
          borderBottom: "1px solid #ffedd5",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#ea580c",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexShrink: 0,
          }}
        >
          <Sparkles size={14} color="#f97316" />
          Quick:
        </span>
        {QUICK_COMMANDS.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickCommandClick(cmd)}
            disabled={loading}
            title={cmd.isInstant ? "Executes immediately" : "Inserts template into prompt"}
            style={{
              whiteSpace: "nowrap",
              fontSize: "12px",
              fontWeight: 500,
              padding: "6px 12px",
              background: "#ffffff",
              border: "1px solid #fed7aa",
              color: "#c2410c",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              fontFamily: "inherit",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#fff7ed")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#ffffff")}
          >
            {cmd.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          padding: "20px 24px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          background: "#faf6f0",
        }}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {loading && (
          <div
            className="animate-fade-in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              alignSelf: "flex-start",
              background: "#ffffff",
              padding: "10px 16px",
              borderRadius: "16px 16px 16px 4px",
              border: "1px solid #fed7aa",
              color: "#ea580c",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(251, 146, 60, 0.08)",
            }}
          >
            <RefreshCw size={14} className="pulse-dot" />
            <span>Processing command...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Form */}
      <form
        onSubmit={handleFormSubmit}
        style={{
          padding: "16px 24px",
          background: "#ffffff",
          borderTop: "1px solid #ffedd5",
          display: "flex",
          gap: "12px",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder='e.g. update the phone number where the email is john@xyz.com to 03237067800'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: "13px 18px",
            background: "#fffdfa",
            border: "1px solid #fed7aa",
            borderRadius: "14px",
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

        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "0 22px",
            background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "14px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(249, 115, 22, 0.3)",
            opacity: loading || !input.trim() ? 0.6 : 1,
            transition: "all 0.15s",
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
