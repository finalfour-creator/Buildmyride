"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/axios";

const BODY_CATEGORY = { id: "body", name: "BODY PAINT", icon: "●" };

/**
 * Phase 3: load entire parts catalog (no carId filter).
 */
export default function useArPartsCatalog() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get("/parts");
        if (!cancelled) {
          setParts(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error("[AR Parts catalog]", err);
        if (!cancelled) {
          const isMobile =
            typeof navigator !== "undefined" &&
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
          setError(
            err.response?.data?.message ||
              (isMobile
                ? "Could not load parts. On phone, set NEXT_PUBLIC_API_URL to http://YOUR_PC_IP:5000/api (not localhost)."
                : "Could not load parts. Check that the API server is running.")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { categories, grouped, totalCount } = useMemo(() => {
    const groupedMap = {};
    const cats = [BODY_CATEGORY];

    parts.forEach((part) => {
      const catId = (part.category || "other").toLowerCase();
      const displayName =
        part.category?.charAt(0).toUpperCase() +
          part.category?.slice(1).toLowerCase() || "Other";

      if (!groupedMap[catId]) {
        groupedMap[catId] = [];
        if (catId !== "body") {
          cats.push({
            id: catId,
            name: displayName.toUpperCase(),
            icon: "▣",
          });
        }
      }
      groupedMap[catId].push(part);
    });

    return {
      categories: cats,
      grouped: groupedMap,
      totalCount: parts.length,
    };
  }, [parts]);

  return { parts, categories, grouped, totalCount, loading, error };
}
