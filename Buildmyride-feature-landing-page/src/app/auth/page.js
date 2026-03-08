
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";


import Input from "@/components/ui/Input"; 
import PrimaryButton from "@/components/ui/PrimaryButton";
import GoogleIcon from "@/components/ui/GoogleIcon";


console.log("Input:", Input);
console.log("PrimaryButton:", PrimaryButton);
console.log("GoogleIcon:", GoogleIcon);




// ─── Theme and Reusable Styles ─────────────────────────────────
const theme = {
  font: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  darkBase: "rgba(26, 26, 29, 0.15)", 
  slidingPanelBg: "linear-gradient(135deg, #22a7f0 0%, #1a1a1d 100%)", 
  accentColor: "#22a7f0",
};


export default function LoginPage() {
  const [isToggled, setIsToggled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div style={{ width: "85%", maxWidth: "1000px", height: "65vh", borderRadius: 24, background: theme.darkBase, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 40px 100px rgba(0,0,0,0.5)", position: "relative", display: "flex", overflow: "hidden", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.23, 1, 0.32, 1)" }}>
        
        {/* Left Section: Sign In */}
        <div style={{ width: "50%", padding: "60px", display: "flex", flexDirection: "column", justifyContent: "center", transition: "opacity 0.6s", opacity: isToggled ? 0 : 1, pointerEvents: isToggled ? "none" : "all" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 25, color: "#fff" }}>Sign In</h1>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, fontSize: 13, color: "#aaa", fontFamily: theme.font }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: 16, height: 16, accentColor: theme.accentColor }} />
              Remember me
            </label>
            <Link href="#" style={{ color: theme.accentColor, textDecoration: "none", fontWeight: 500 }}>Forgot Password?</Link>
          </div>
          <PrimaryButton onClick={() => console.log("Login")}>Login</PrimaryButton>
          <div style={{ textAlign: "center", marginTop: 25 }}>
             <div style={{ fontSize: 13, color: "#888", marginBottom: 15, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
               <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", flex: 1 }}></div> or <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", flex: 1 }}></div>
             </div>
            <button style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 20px", borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12, width: "100%", transition: "0.3s", color: "#fff", fontWeight: 600, fontFamily: theme.font }}>
              <GoogleIcon /> Continue with Google
            </button>
          </div>
        </div>

        {/* Right Section: Create Account */}
        <div style={{ width: "50%", padding: "60px", display: "flex", flexDirection: "column", justifyContent: "center", transition: "opacity 0.6s", opacity: isToggled ? 1 : 0, pointerEvents: isToggled ? "all" : "none" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 25, color: "#fff" }}>Create Account</h1>
          <Input label="Full Name" />
          <Input label="Email" type="email" />
          <Input label="Password" type="password" />
          <PrimaryButton onClick={() => console.log("Register")}>Register</PrimaryButton>
        </div>

        {/* Sliding Panel */}
        <div style={{ 
          position: "absolute", 
          top: 0, 
          left: isToggled ? "0%" : "50%", 
          width: "50%", 
          height: "100%", 
          zIndex: 10, 
          transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)", 
          background: theme.slidingPanelBg, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: "0 60px", 
          textAlign: "center", 
          color: "#fff",
          // The shiny blueish shadow logic
          boxShadow: isToggled ? "20px 0 50px rgba(34, 167, 240, 0.3)" : "-20px 0 50px rgba(34, 167, 240, 0.3)" 
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 15 }}>
            {isToggled ? "Already a Member?" : "Hello, Friend!"}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.8)", marginBottom: 30 }}>
            {isToggled 
              ? "To keep connected with us please login with your personal info" 
              : "Enter your personal details and start your journey with us"}
          </p>
          <PrimaryButton inverted onClick={() => setIsToggled(!isToggled)}>
            {isToggled ? "SIGN IN" : "SIGN UP"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}