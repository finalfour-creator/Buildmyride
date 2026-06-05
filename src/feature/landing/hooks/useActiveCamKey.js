"use client";
import { useAppSelector } from "@/store/hooks";

const V_KEYS = ["hero", "manifesto1", "manifesto2", "chassis"];
const H_KEYS = ["engine", "body", "wheels", "exhaust", "ar", "summary", "community", "cta"];

export function useActiveCamKey() {
  const phase = useAppSelector((s) => s.navigation.phase);
  const vIdx = useAppSelector((s) => s.navigation.vIdx);
  const hIdx = useAppSelector((s) => s.navigation.hIdx);

  if (phase === 0) return V_KEYS[Math.max(0, Math.min(3, vIdx))];
  return H_KEYS[Math.max(0, Math.min(7, hIdx))];
}
