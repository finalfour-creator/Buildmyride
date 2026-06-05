"use client";
import { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, TextField, Button, Paper } from "@mui/material";

export default function AiChatbox({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { type: "assistant", content: "Hello! I'm your AI design assistant. Ask me about color combinations, part compatibility, or styling suggestions." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes("color")) {
      return "For your Honda Civic, Midnight Blue or Gunmetal Gray would complement the lines well. Matte finishes are trending but require more maintenance.";
    }
    if (lowerMsg.includes("rim") || lowerMsg.includes("wheel")) {
      return "18-inch alloy wheels with a matte black finish would create a cohesive look. Forged options reduce weight and improve handling.";
    }
    if (lowerMsg.includes("compatible")) {
      return "All selected parts are compatible with the 2024 Honda Civic. The aftermarket support for this platform is extensive.";
    }
    return "I understand you're asking about that. Could you provide more details about your specific build? I can help with colors, parts, compatibility, or design suggestions.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMessage = { type: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => {
      const response = generateResponse(inputValue);
      setMessages(prev => [...prev, { type: "assistant", content: response }]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000 }}>
      <Paper elevation={8} sx={{ width: 380, height: 520, display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e8e0d6" }}>
        {/* Header */}
        <Box sx={{ p: 2, background: "linear-gradient(135deg, #0f2027, #2c5364)", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>AI Design Assistant</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white", fontSize: 20 }} size="small">
            ✕
          </IconButton>
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2, background: "#fefcf8" }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ mb: 2, display: "flex", justifyContent: msg.type === "user" ? "flex-end" : "flex-start" }}>
              <Paper sx={{
                maxWidth: "80%",
                p: 1.5,
                background: msg.type === "user" ? "linear-gradient(135deg, #0f2027, #2c5364)" : "#f0ece4",
                color: msg.type === "user" ? "white" : "#1a2a32",
                fontSize: 13,
              }}>
                {msg.content}
              </Paper>
            </Box>
          ))}
          {isTyping && (
            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-start" }}>
              <Paper sx={{ p: 1.5, background: "#f0ece4", fontSize: 13 }}>
                <span style={{ animation: "pulse 1.2s infinite" }}>●</span>
                <span style={{ animation: "pulse 1.2s infinite 0.2s", marginLeft: 4 }}>●</span>
                <span style={{ animation: "pulse 1.2s infinite 0.4s", marginLeft: 4 }}>●</span>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: "1px solid #e8e0d6", display: "flex", gap: 1, background: "white" }}>
          <TextField
            fullWidth
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about colors, parts, compatibility..."
            variant="outlined"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
          />
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={!inputValue.trim()}
            sx={{
              background: "linear-gradient(135deg, #0f2027, #2c5364)",
              borderRadius: 0,
              textTransform: "none",
              "&:hover": { opacity: 0.9 },
            }}
          >
            Send
          </Button>
        </Box>
      </Paper>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        span { display: inline-block; }
      `}</style>
    </Box>
  );
}