import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="landing-nav" id="landing-nav">
      <div className="landing-nav-logo">BUILDMYRIDE</div>
      <div className="landing-nav-links">
        <Link href="/login">Login</Link>
        <Link href="/login" className="nav-register">
          Register
        </Link>
      </div>
    </nav>
  );
}
