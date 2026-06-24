"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import Input from "./components/Input";
import PrimaryButton from "./components/PrimaryButton";

const RULES = [
  { label: "At least 8 characters",      test: (v) => v.length >= 8 },
  { label: "One uppercase letter (A-Z)",  test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter (a-z)",  test: (v) => /[a-z]/.test(v) },
  { label: "One number (0-9)",            test: (v) => /[0-9]/.test(v) },
  { label: "One special character",       test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token");

  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);
  const [visible,     setVisible]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const failed = RULES.find((r) => !r.test(password));
    if (failed) { setError(failed.label); return; }

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res  = await fetch(`${apiBase}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong."); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: "linear-gradient(rgba(0,0,0,0.65),rgba(0,0,0,0.65)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 440, mx: 2, borderRadius: 4, background: "rgba(15,25,35,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", p: "48px 44px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: "all 0.7s cubic-bezier(0.23,1,0.32,1)" }}>

        {success ? (
          /* ── Success state ── */
          <Box sx={{ textAlign: "center" }}>
            <CheckCircle size={52} color="#4caf50" style={{ marginBottom: 16 }} />
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#fff", mb: 1 }}>
              Password Reset!
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.5)", mb: 3 }}>
              Your password has been updated successfully. Redirecting you to sign in…
            </Typography>
            <Box sx={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <Box sx={{ height: "100%", background: "#22a7f0", animation: "progress 3s linear forwards", "@keyframes progress": { from: { width: "0%" }, to: { width: "100%" } } }} />
            </Box>
          </Box>
        ) : (
          /* ── Form state ── */
          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", mb: 0.5 }}>
              New Password
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.45)", mb: 4 }}>
              Choose a strong password for your account
            </Typography>

            <Input
              label="New Password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endAdornment={
                <IconButton onClick={() => setShowPass((p) => !p)} onMouseDown={(e) => e.preventDefault()} size="small" tabIndex={-1} sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#22a7f0" }, p: 0.5 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </IconButton>
              }
            />

            <Input
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              endAdornment={
                <IconButton onClick={() => setShowConfirm((p) => !p)} onMouseDown={(e) => e.preventDefault()} size="small" tabIndex={-1} sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#22a7f0" }, p: 0.5 }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </IconButton>
              }
            />

            {/* Password strength checklist */}
            {password.length > 0 && (
              <Box sx={{ mb: 2.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
                {RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <Box key={rule.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {passed
                        ? <CheckCircle size={13} color="#4caf50" />
                        : <XCircle    size={13} color="rgba(255,255,255,0.2)" />}
                      <Typography sx={{ fontSize: 11, color: passed ? "#4caf50" : "rgba(255,255,255,0.35)" }}>
                        {rule.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}

            {error && (
              <Typography sx={{ fontSize: 12, color: "#f44336", mb: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}

            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </PrimaryButton>

            <Typography
              onClick={() => router.push("/login")}
              sx={{ mt: 2.5, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.35)", cursor: "pointer", "&:hover": { color: "#22a7f0" } }}
            >
              Back to Sign In
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
