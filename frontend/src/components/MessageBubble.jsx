import React from "react";
import { User } from "lucide-react";
import BotLogo from "./BotLogo";

export default function MessageBubble({ message }) {
  const isBot = message.sender === "bot";

  // Simple Markdown renderer for bold, code tags, and lists
  const renderFormattedText = (text) => {
    return text.split("\n").map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      return (
        <div key={lineIdx} style={{ minHeight: "1.25em", marginBottom: lineIdx !== text.split("\n").length - 1 ? "4px" : "0" }}>
          {parts.map((part, partIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={partIdx} style={{ color: isBot ? "#0f172a" : "#ffffff", fontWeight: 600 }}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code
                  key={partIdx}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.85em",
                    backgroundColor: isBot ? "#fff7ed" : "rgba(255, 255, 255, 0.25)",
                    border: isBot ? "1px solid #fed7aa" : "none",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    color: isBot ? "#c2410c" : "#ffffff",
                    fontWeight: 500,
                  }}
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        alignItems: "flex-end",
        gap: "10px",
        marginBottom: "16px",
        width: "100%",
      }}
    >
      {isBot && (
        <BotLogo size={18} containerSize={36} borderRadius={12} />
      )}

      <div
        style={{
          maxWidth: "78%",
          background: isBot ? "#ffffff" : "linear-gradient(135deg, #fb923c, #f97316)",
          color: isBot ? "#334155" : "#ffffff",
          padding: "12px 18px",
          borderRadius: isBot ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
          border: isBot ? "1px solid #fed7aa" : "none",
          boxShadow: isBot
            ? "0 4px 16px rgba(251, 146, 60, 0.08)"
            : "0 4px 16px rgba(249, 115, 22, 0.3)",
          fontSize: "14px",
          lineHeight: "1.6",
          wordBreak: "break-word",
        }}
      >
        {renderFormattedText(message.text)}

        {message.timestamp && (
          <div
            style={{
              fontSize: "11px",
              opacity: isBot ? 0.6 : 0.8,
              marginTop: "6px",
              textAlign: isBot ? "left" : "right",
              color: isBot ? "#64748b" : "#fff",
            }}
          >
            {message.timestamp}
          </div>
        )}
      </div>

      {!isBot && (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ea580c, #c2410c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)",
          }}
        >
          <User size={18} />
        </div>
      )}
    </div>
  );
}
