"use client";
import { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, TextField, Button, Paper } from "@mui/material";

export default function AiChatbox({ isOpen, onClose, config }) {
  const [messages, setMessages] = useState([
    {
      type: "assistant",
      content:
        "Hello! I'm your AI design assistant. Ask me about styling, compatibility, or improvements.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ REAL AI CALL
  const getAIResponse = async (message) => {
    const res = await fetch("/api/design-advisor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, config }),
    });

    const data = await res.json();
    return data.reply;
  };

  // ✅ UPDATED SEND HANDLER
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { type: "user", content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await getAIResponse(inputValue);

      setMessages((prev) => [
        ...prev,
        { type: "assistant", content: response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "AI could not respond. Please try again.",
        },
      ]);
    }

    setIsTyping(false);
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
      <Paper
        elevation={8}
        sx={{
          width: 380,
          height: 520,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #e8e0d6",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
              AI Design Advisor
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ color: "white", fontSize: 20 }}
            size="small"
          >
            ✕
          </IconButton>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            background: "#fefcf8",
          }}
        >
          {messages.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 2,
                display: "flex",
                justifyContent:
                  msg.type === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Paper
                sx={{
                  maxWidth: "80%",
                  p: 1.5,
                  background:
                    msg.type === "user"
                      ? "linear-gradient(135deg, #0f2027, #2c5364)"
                      : "#f0ece4",
                  color: msg.type === "user" ? "white" : "#1a2a32",
                  fontSize: 13,
                }}
              >
                {msg.content}
              </Paper>
            </Box>
          ))}

          {isTyping && (
            <Box sx={{ mb: 2 }}>
              <Paper sx={{ p: 1.5 }}>Thinking...</Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #e8e0d6",
            display: "flex",
            gap: 1,
            background: "white",
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about design, compatibility..."
            variant="outlined"
          />
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={!inputValue.trim()}
            sx={{
              background: "linear-gradient(135deg, #0f2027, #2c5364)",
              textTransform: "none",
            }}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}