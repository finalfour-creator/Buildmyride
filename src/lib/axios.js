import axios from "axios";
import { getSession } from "next-auth/react";

const normalizeApiBase = (url) => {
  const trimmed = (url || "").trim();
  if (!trimmed) return "http://localhost:5000/api";

  // remove trailing slashes
  const noTrailing = trimmed.replace(/\/+$/, "");

  // already ends with /api
  if (noTrailing.toLowerCase().endsWith("/api")) return noTrailing;

  // if it ends with something like /api/.. handled above; otherwise append /api
  return `${noTrailing}/api`;
};

const baseURL = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);

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
