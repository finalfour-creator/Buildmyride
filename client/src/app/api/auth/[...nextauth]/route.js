import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

CredentialsProvider({
  name: "credentials",
  credentials: {
    email: {},
    password: {},
  },

  async authorize(credentials) {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const user = await res.json();

    if (!res.ok) {
      throw new Error("Invalid credentials");
    }

    return user;
  },
})