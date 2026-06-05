import { Box, Typography } from "@mui/material";
import Link from "next/link";

export default function ToolCard({ emoji, name, desc, href }) {
  const content = (
    <Box sx={{ background: "white", border: "1px solid #e8e0d6", p: 3, textAlign: "center", cursor: "pointer", transition: "transform 0.2s", "&:hover": { transform: "translateY(-2px)" } }}>
      <Typography variant="h3" sx={{ fontSize: 28, mb: 1 }}>{emoji}</Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13, color: "#1a2a32", mb: 0.5 }}>{name}</Typography>
      <Typography variant="caption" sx={{ fontSize: 11, color: "#8a9aa8" }}>{desc}</Typography>
    </Box>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
  }
  return content;
}