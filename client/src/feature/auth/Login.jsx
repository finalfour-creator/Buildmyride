"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "./components/Input";
import PrimaryButton from "./components/PrimaryButton";
  import GoogleIcon from "./components/GoogleIcon";

const ACCENT = "#22a7f0";
const SLIDING_BG = "linear-gradient(135deg, #22a7f0 0%, #1a1a1d 100%)";

export default function LoginPage() {
  const router = useRouter();
  const [isToggled, setIsToggled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleRegister = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email: regEmail,
        password: regPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed ❌");
    } else {
      alert("Registration Successful ✅");
    }

  } catch (error) {
    console.error(error);
  }
};

  const handleLogin = async () => {
    
           const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
           if (result?.error) {
            alert("Invalid email or password ❌");
          } else {
            router.push("/configurator/dashboard");
            }};

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        sx={{
          width: "85%",
          maxWidth: 1000,
          height: "65vh",
          borderRadius: 6,
          background: "rgba(26,26,29,0.15)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
          position: "relative",
          display: "flex",
          overflow: "hidden",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {/* ── Sign In Panel ── */}
        <Box
          sx={{
            width: "50%",
            p: "60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity: isToggled ? 0 : 1,
            pointerEvents: isToggled ? "none" : "all",
            transition: "opacity 0.6s",
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={3} color="#fff">
            Sign In
          </Typography>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{ color: "#aaa", "&.Mui-checked": { color: ACCENT }, p: 0.5 }}
                />
              }
              label={<Typography sx={{ fontSize: 13, color: "#aaa" }}>Remember me</Typography>}
            />
            <Link href="#" style={{ color: ACCENT, textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
              Forgot Password?
            </Link>
          </Box>

          <PrimaryButton onClick={handleLogin}>Login</PrimaryButton>

          <Divider sx={{ my: 2, "&::before, &::after": { borderColor: "rgba(255,255,255,0.1)" } }}>
            <Typography sx={{ fontSize: 13, color: "#888", px: 1 }}>or</Typography>
          </Divider>

          <Button
            fullWidth
            startIcon={<GoogleIcon />}
            sx={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              py: 1.5,
              "&:hover": { background: "rgba(255,255,255,0.1)" },
            }}
          >
            Continue with Google
          </Button>
        </Box>

        {/* ── Create Account Panel ── */}
        <Box
          sx={{
            width: "50%",
            p: "60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity: isToggled ? 1 : 0,
            pointerEvents: isToggled ? "all" : "none",
            transition: "opacity 0.6s",
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={3} color="#fff">
            Create Account
          </Typography>
          <Input label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" 
          value={regEmail} 
          onChange={(e) => setRegEmail(e.target.value)} />
          <Input label="Password" type="password" 
          value={regPassword} 
          onChange={(e) => setRegPassword(e.target.value)} />
          <PrimaryButton onClick={handleRegister}>Register</PrimaryButton>
        </Box>

        {/* ── Sliding Panel ── */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: isToggled ? "0%" : "50%",
            width: "50%",
            height: "100%",
            zIndex: 10,
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            background: SLIDING_BG,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: "60px",
            textAlign: "center",
            color: "#fff",
            boxShadow: isToggled
              ? "20px 0 50px rgba(34,167,240,0.3)"
              : "-20px 0 50px rgba(34,167,240,0.3)",
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={2}>
            {isToggled ? "Already a Member?" : "Hello, Friend!"}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.8)", mb: 4 }}>
            {isToggled
              ? "To keep connected with us please login with your personal info"
              : "Enter your personal details and start your journey with us"}
          </Typography>
          <PrimaryButton inverted onClick={() => setIsToggled(!isToggled)}>
            {isToggled ? "SIGN IN" : "SIGN UP"}
          </PrimaryButton>
        </Box>
      </Box>
    </Box>
  );
}