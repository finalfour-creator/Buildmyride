import axios from "axios";
import { getSession } from "next-auth/react";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Axios instance for backend API. Attaches Bearer token from NextAuth session when available.
 */
const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

export default apiClient;
