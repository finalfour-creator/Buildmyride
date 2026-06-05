

import CredentialsProvider from "next-auth/providers/credentials";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          const body = await res.json();
          console.log("[NextAuth] authorize status:", res.status, "body:", JSON.stringify(body));
          
          // If login failed, throw error with field info so client can display under correct field
          if (!res.ok) {
            throw new Error(JSON.stringify(body));
          }
          
          if (!body?.user || !body?.token) {
            throw new Error(JSON.stringify({ field: "email", message: "Invalid email or password" }));
          }
          
          return {
            id: body.user.id,
            email: body.user.email,
            name: body.user.name || body.user.email.split("@")[0],
            accessToken: body.token,
          };
        } catch (err) {
          console.error("[NextAuth] authorize error:", err);
          // If error is already a stringified JSON object, re-throw it
          if (err.message && err.message.startsWith("{")) {
            throw err;
          }
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // ✅ HANDLE SESSION UPDATE FROM CLIENT
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      if (trigger === "update" && session?.email) {
        token.email = session.email;
      }
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};