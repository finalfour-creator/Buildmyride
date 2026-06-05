"use client";
import { motion } from "framer-motion";

export default function KineticText({
  text,
  baseDelay = 0,
  charDelay = 0.04,
  stroked = false,
  sx = {},
}) {
  const chars = Array.from(text);

  return (
    <span
      key={text}
      style={{
        display: "inline-block",
        perspective: 600,
        ...(stroked
          ? {
              WebkitTextStroke: "2px currentColor",
              color: "transparent",
            }
          : {}),
        ...sx,
      }}
    >
      {chars.map((c, i) => (
        <motion.span
          key={`${c}-${i}`}
          initial={{ opacity: 0, y: "60%", rotateX: -90, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
          transition={{
            delay: baseDelay + i * charDelay,
            duration: 0.9,
            ease: [0.2, 0.6, 0.2, 1],
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {c === " " ? " " : c}
        </motion.span>
      ))}
    </span>
  );
}
