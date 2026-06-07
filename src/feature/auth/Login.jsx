"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Input from "./components/Input";
import PrimaryButton from "./components/PrimaryButton";

const ACCENT = "#2c5364";
const SLIDING_BG = "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";

const passwordRules = {
  required: "Password is required",
  minLength: { value: 8, message: "At least 8 characters" },
  validate: {
    uppercase: (v) => /[A-Z]/.test(v) || "Needs 1 uppercase letter (A-Z)",
    lowercase: (v) => /[a-z]/.test(v) || "Needs 1 lowercase letter (a-z)",
    number: (v) => /[0-9]/.test(v) || "Needs 1 number (0-9)",
    special: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) || "Needs 1 special character",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [isToggled, setIsToggled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    setError: setLoginError,
    formState: { errors: loginErrors, isSubmitting: loginSubmitting },
  } = useForm();

  // Register form
  const {
    register: regRegister,
    handleSubmit: handleRegSubmit,
    setError: setRegError,
    reset: resetRegForm,
    formState: { errors: regErrors, isSubmitting: regSubmitting },
  } = useForm();

  const [regServerError, setRegServerError] = useState("");

  const handleLogin = async (data) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      try {
        const errorData = JSON.parse(result.error);
        if (errorData.field === "email") {
          setLoginError("email", { message: errorData.message });
        } else if (errorData.field === "password") {
          setLoginError("password", { message: errorData.message });
        } else {
          setLoginError("email", { message: "Invalid email or password" });
        }
      } catch {
        setLoginError("email", { message: "Invalid email or password" });
      }
    } else {
      router.push("/configurator/dashboard");
    }
  };

  const handleRegister = async (data) => {
    setRegServerError("");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setRegServerError(resData.message || "Registration failed");
        return;
      }

      resetRegForm();
      setIsToggled(false);
    } catch {
      setRegServerError("Connection error. Please try again.");
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: "linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <Box sx={{ width: "85%", maxWidth: 1000, height: "65vh", borderRadius: 6, background: "rgba(26,26,29,0.15)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 100px rgba(0,0,0,0.5)", position: "relative", display: "flex", overflow: "hidden", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)" }}>

        {/* SIGN IN PANEL */}
        <Box
          component="form"
          onSubmit={handleLoginSubmit(handleLogin)}
          sx={{ width: "50%", p: "60px", display: "flex", flexDirection: "column", justifyContent: "center", opacity: isToggled ? 0 : 1, pointerEvents: isToggled ? "none" : "all", transition: "opacity 0.6s" }}
        >
          <Typography variant="h4" fontWeight={700} mb={3} color="#fff">Sign In</Typography>

          <Input
            label="Email"
            type="email"
            registration={loginRegister("email", { required: "Email is required" })}
            error={!!loginErrors.email}
            helperText={loginErrors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            registration={loginRegister("password", { required: "Password is required" })}
            error={!!loginErrors.password}
            helperText={loginErrors.password?.message}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} size="small" sx={{ color: "#aaa", "&.Mui-checked": { color: ACCENT }, p: 0.5 }} />} label={<Typography sx={{ fontSize: 13, color: "#aaa" }}>Remember me</Typography>} />
            <Link href="#" style={{ color: ACCENT, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>Forgot Password?</Link>
          </Box>

          <PrimaryButton type="submit" disabled={loginSubmitting}>
            {loginSubmitting ? "Signing in..." : "Login"}
          </PrimaryButton>

          <Divider sx={{ my: 2, "&::before, &::after": { borderColor: "rgba(255,255,255,0.1)" } }}>
            <Typography sx={{ fontSize: 13, color: "#888", px: 1 }}>or</Typography>
          </Divider>

        </Box>

        {/* CREATE ACCOUNT PANEL */}
        <Box
          component="form"
          onSubmit={handleRegSubmit(handleRegister)}
          sx={{ width: "50%", p: "60px", display: "flex", flexDirection: "column", justifyContent: "center", opacity: isToggled ? 1 : 0, pointerEvents: isToggled ? "all" : "none", transition: "opacity 0.6s" }}
        >
          <Typography variant="h4" fontWeight={700} mb={3} color="#fff">Create Account</Typography>

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
            type="password"
            registration={regRegister("password", passwordRules)}
            error={!!regErrors.password}
            helperText={regErrors.password?.message}
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

        {/* SLIDING PANEL */}
        <Box sx={{ position: "absolute", top: 0, left: isToggled ? "0%" : "50%", width: "50%", height: "100%", zIndex: 10, transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)", background: SLIDING_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: "60px", textAlign: "center", color: "#fff", boxShadow: isToggled ? "20px 0 50px rgba(15,32,39,0.3)" : "-20px 0 50px rgba(15,32,39,0.3)" }}>
          <Typography variant="h4" fontWeight={700} mb={2}>{isToggled ? "Already a Member?" : "Hello, Friend!"}</Typography>
          <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.8)", mb: 4 }}>{isToggled ? "To keep connected with us please login with your personal info" : "Enter your personal details and start your journey with us"}</Typography>
          <PrimaryButton inverted onClick={() => setIsToggled(!isToggled)}>{isToggled ? "SIGN IN" : "SIGN UP"}</PrimaryButton>
        </Box>
      </Box>
    </Box>
  );
}
