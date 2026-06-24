"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";

export default function IntroAnimation({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) setTimeout(onComplete, 100);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ textAlign: "center" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 40, md: 80 },
                  color: "#fff",
                  letterSpacing: "4px",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                BUILDMYRIDE
              </Typography>
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{
                height: 2,
                background: "#fff",
                margin: "0 auto",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}