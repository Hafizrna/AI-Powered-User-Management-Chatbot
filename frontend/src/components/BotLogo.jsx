import React, { useState } from "react";
import { Bot } from "lucide-react";

export default function BotLogo({ size = 24, containerSize = 44, borderRadius = 14 }) {
  const [srcIndex, setSrcIndex] = useState(0);
  const sources = ["/logo.png", "/logo.jpg", "/logo.jpeg", "/logo.svg"];

  return (
    <div
      style={{
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        borderRadius: `${borderRadius}px`,
        background: "linear-gradient(135deg, #fb923c, #f97316)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(249, 115, 22, 0.28)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {srcIndex < sources.length ? (
        <img
          src={sources[srcIndex]}
          alt="Chatbot Logo"
          onError={() => setSrcIndex((prev) => prev + 1)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Bot size={size} />
      )}
    </div>
  );
}
