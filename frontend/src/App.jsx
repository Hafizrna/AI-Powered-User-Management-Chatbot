import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Chat from "./components/Chat";

export default function App() {
  const [admin, setAdmin] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Auto-login: Check localStorage on app load
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) {
          setAdmin(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to parse saved session:", e);
      localStorage.removeItem("admin_session");
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const handleLoginSuccess = (adminData) => {
    localStorage.setItem("admin_session", JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    setAdmin(null);
  };

  if (checkingAuth) {
    return (
      <div style={{ color: "#94a3b8", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>Initializing...</span>
      </div>
    );
  }

  return (
    <>
      {admin ? (
        <Chat admin={admin} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}
