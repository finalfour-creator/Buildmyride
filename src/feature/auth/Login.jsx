"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { Eye, EyeOff } from "lucide-react";
import Input from "./components/Input";
import PrimaryButton from "./components/PrimaryButton";

const SLIDING_BG = "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";

const passwordRules = {
  required: "Password is required",
  minLength: { value: 8, message: "At least 8 characters" },
  validate: {
    uppercase: (v) => /[A-Z]/.test(v) || "Needs 1 uppercase letter (A-Z)",
    lowercase: (v) => /[a-z]/.test(v) || "Needs 1 lowercase letter (a-z)",
    number:    (v) => /[0-9]/.test(v) || "Needs 1 number (0-9)",
    special:   (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) || "Needs 1 special character",
  },
};

function PasswordToggle({ show, onToggle }) {
  return (
    <IconButton
      onClick={onToggle}
      onMouseDown={(e) => e.preventDefault()}
      size="small"
      tabIndex={-1}
      sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#22a7f0" }, p: 0.5 }}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </IconButton>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isToggled, setIsToggled] = useState(false);
  const [visible, setVisible]     = useState(false);

  // Password visibility
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass,   setShowRegPass]   = useState(false);

  // Remember me
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password dialog
  const [forgotOpen,    setForgotOpen]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus,  setForgotStatus]  = useState({ type: "", message: "" });

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    setError: setLoginError,
    setValue: setLoginValue,
    formState: { errors: loginErrors, isSubmitting: loginSubmitting },
  } = useForm();

  // Register form
  const {
    register: regRegister,
    handleSubmit: handleRegSubmit,
    reset: resetRegForm,
    formState: { errors: regErrors, isSubmitting: regSubmitting },
  } = useForm();

  const [regServerError, setRegServerError] = useState("");

  // Load remembered email on mount
  useEffect(() => {
    const saved = localStorage.getItem("bmr_remembered_email");
    if (saved) {
      setLoginValue("email", saved);
      setRememberMe(true);
    }
  }, [setLoginValue]);

  // Fade-in animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (data) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      try {
        const err = JSON.parse(result.error);
        if (err.field === "password") {
          setLoginError("password", { message: err.message });
        } else {
          setLoginError("email", { message: err.message || "Invalid email or password" });
        }
      } catch {
        setLoginError("email", { message: "Invalid email or password" });
      }
    } else {
      if (rememberMe) {
        localStorage.setItem("bmr_remembered_email", data.email);
      } else {
        localStorage.removeItem("bmr_remembered_email");
      }
      router.push("/configurator/dashboard");
    }
  };

  const handleRegister = async (data) => {
    setRegServerError("");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const resData = await res.json();
      if (!res.ok) { setRegServerError(resData.message || "Registration failed"); return; }
      resetRegForm();
      setIsToggled(false);
    } catch {
      setRegServerError("Connection error. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotStatus({ type: "error", message: "Please enter your email address." });
      return;
    }
    setForgotLoading(true);
    setForgotStatus({ type: "", message: "" });
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res  = await fetch(`${apiBase}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotStatus({
        type: res.ok ? "success" : "error",
        message: data.message || "If that email is registered, a reset link has been sent.",
      });
    } catch {
      setForgotStatus({ type: "error", message: "Connection error. Please try again." });
    } finally {
      setForgotLoading(false);
    }
  };

  const dialogInputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#fff", fontSize: 14, borderRadius: 2,
      background: "rgba(255,255,255,0.05)",
      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
      "&.Mui-focused fieldset": { borderColor: "#22a7f0" },
    },
    "& .MuiInputLabel-root": { color: "#aaa", fontSize: 13 },
    "& .MuiInputLabel-root.Mui-focused": { color: "#22a7f0" },
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: "linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <Box sx={{ width: "85%", maxWidth: 1000, minHeight: "65vh", borderRadius: 6, background: "rgba(26,26,29,0.15)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 100px rgba(0,0,0,0.5)", position: "relative", display: "flex", overflow: "hidden", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)" }}>

        {/* ── SIGN IN PANEL ── */}
        <Box
          component="form"
          onSubmit={handleLoginSubmit(handleLogin)}
          sx={{ width: "50%", px: "60px", py: "50px", display: "flex", flexDirection: "column", justifyContent: "center", opacity: isToggled ? 0 : 1, pointerEvents: isToggled ? "none" : "all", transition: "opacity 0.6s" }}
        >
          <Typography sx={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", mb: 0.5 }}>
            Sign In
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.45)", mb: 4 }}>
            Enter your email &amp; password
          </Typography>

          <Input
            label="Email"
            type="email"
            registration={loginRegister("email", { required: "Email is required" })}
            error={!!loginErrors.email}
            helperText={loginErrors.email?.message}
          />

          <Input
            label="Password"
            type={showLoginPass ? "text" : "password"}
            registration={loginRegister("password", { required: "Password is required" })}
            error={!!loginErrors.password}
            helperText={loginErrors.password?.message}
            endAdornment={
              <PasswordToggle
                show={showLoginPass}
                onToggle={() => setShowLoginPass((p) => !p)}
              />
            }
          />

          {/* Remember me + Forgot password */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, mt: -0.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{ color: "rgba(255,255,255,0.25)", "&.Mui-checked": { color: "#22a7f0" }, p: 0.5 }}
                />
              }
              label={<Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Remember me</Typography>}
              sx={{ m: 0 }}
            />
            <Typography
              onClick={() => { setForgotEmail(""); setForgotStatus({ type: "", message: "" }); setForgotOpen(true); }}
              sx={{ fontSize: 12, fontWeight: 600, color: "#22a7f0", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
            >
              Forgot Password?
            </Typography>
          </Box>

          <PrimaryButton type="submit" disabled={loginSubmitting}>
            {loginSubmitting ? "Signing in..." : "Login"}
          </PrimaryButton>
        </Box>

        {/* ── CREATE ACCOUNT PANEL ── */}
        <Box
          component="form"
          onSubmit={handleRegSubmit(handleRegister)}
          sx={{ width: "50%", px: "60px", py: "50px", display: "flex", flexDirection: "column", justifyContent: "center", opacity: isToggled ? 1 : 0, pointerEvents: isToggled ? "all" : "none", transition: "opacity 0.6s" }}
        >
          <Typography sx={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", mb: 0.5 }}>
            Create Account
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.45)", mb: 4 }}>
            Fill in your details to get started
          </Typography>

          <Input
            label="Full Name"
            registration={regRegister("name", { required: "Name is required" })}
            error={!!regErrors.name}
            helperText={regErrors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            registration={regRegister("email", { required: "Email is required" })}
            error={!!regErrors.email}
            helperText={regErrors.email?.message}
          />

          <Input
            label="Password"
            type={showRegPass ? "text" : "password"}
            registration={regRegister("password", passwordRules)}
            error={!!regErrors.password}
            helperText={regErrors.password?.message}
            endAdornment={
              <PasswordToggle
                show={showRegPass}
                onToggle={() => setShowRegPass((p) => !p)}
              />
            }
          />

          {regServerError && (
            <Typography sx={{ color: "#f44336", fontSize: 12, mb: 2, textAlign: "center" }}>
              {regServerError}
            </Typography>
          )}

          <PrimaryButton type="submit" disabled={regSubmitting}>
            {regSubmitting ? "Registering..." : "Register"}
          </PrimaryButton>
        </Box>

        {/* ── SLIDING PANEL ── */}
        <Box sx={{ position: "absolute", top: 0, left: isToggled ? "0%" : "50%", width: "50%", height: "100%", zIndex: 10, transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)", background: SLIDING_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: "60px", textAlign: "center", color: "#fff", boxShadow: isToggled ? "20px 0 50px rgba(15,32,39,0.3)" : "-20px 0 50px rgba(15,32,39,0.3)" }}>
          <Typography variant="h4" fontWeight={700} mb={2}>
            {isToggled ? "Already a Member?" : "Hello, Friend!"}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.8)", mb: 4 }}>
            {isToggled ? "To keep connected with us please login with your personal info" : "Enter your personal details and start your journey with us"}
          </Typography>
          <PrimaryButton inverted onClick={() => setIsToggled(!isToggled)}>
            {isToggled ? "SIGN IN" : "SIGN UP"}
          </PrimaryButton>
        </Box>
      </Box>

      {/* ── FORGOT PASSWORD DIALOG ── */}
      <Dialog
        open={forgotOpen}
        onClose={() => !forgotLoading && setForgotOpen(false)}
        PaperProps={{
          sx: {
            background: "#0d1b26",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 3,
            color: "#fff",
            minWidth: 380,
            p: 1,
          }
        }}
      >
        <DialogTitle sx={{ color: "#fff", fontWeight: 800, fontSize: 22, pb: 0.5 }}>
          Reset Password
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13, mb: 3 }}>
            Enter your registered email and we&apos;ll send you a password reset link.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            label="Email Address"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
            sx={dialogInputSx}
          />
          {forgotStatus.message && (
            <Typography sx={{ mt: 1.5, fontSize: 12, color: forgotStatus.type === "success" ? "#4caf50" : "#f44336" }}>
              {forgotStatus.message}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Box
            component="button"
            type="button"
            onClick={() => setForgotOpen(false)}
            disabled={forgotLoading}
            sx={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)", borderRadius: 2, px: 3, py: 1, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: "rgba(255,255,255,0.35)", color: "#fff" } }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            type="button"
            onClick={handleForgotPassword}
            disabled={forgotLoading}
            sx={{ background: "#22a7f0", border: "none", color: "#fff", borderRadius: 2, px: 3, py: 1, fontSize: 12, fontWeight: 700, cursor: forgotLoading ? "not-allowed" : "pointer", opacity: forgotLoading ? 0.7 : 1, transition: "all 0.2s", "&:hover": { background: forgotLoading ? "#22a7f0" : "#1a90d0" } }}
          >
            {forgotLoading ? "Sending..." : "Send Reset Link"}
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
