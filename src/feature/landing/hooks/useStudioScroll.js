"use client";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setVIdx,
  setHIdx,
  setPhase,
  lockNav,
  unlockNav,
} from "@/store/slices/navigationSlice";

const NAV_LOCK_MS = 850;
const WHEEL_THRESHOLD = 24;
const TOUCH_THRESHOLD = 40;

export function useStudioScroll() {
  const dispatch = useAppDispatch();
  const phase = useAppSelector((s) => s.navigation.phase);
  const vIdx = useAppSelector((s) => s.navigation.vIdx);
  const hIdx = useAppSelector((s) => s.navigation.hIdx);
  const navLock = useAppSelector((s) => s.navigation.navLock);
  const chassis = useAppSelector((s) => s.build.chassis);

  const stateRef = useRef({ phase, vIdx, hIdx, navLock, chassis });
  stateRef.current = { phase, vIdx, hIdx, navLock, chassis };

  useEffect(() => {
    const advance = (direction) => {
      const s = stateRef.current;
      if (s.navLock) return;

      let acted = false;

      if (s.phase === 0) {
        // Vertical navigation
        if (direction === "down") {
          if (s.vIdx < 3) {
            dispatch(setVIdx(s.vIdx + 1));
            acted = true;
          } else if (s.vIdx === 3 && s.chassis) {
            dispatch(setPhase(1));
            dispatch(setHIdx(0));
            acted = true;
          }
        } else if (direction === "up") {
          if (s.vIdx > 0) {
            dispatch(setVIdx(s.vIdx - 1));
            acted = true;
          }
        }
      } else {
        // Phase 1 + 2 — horizontal navigation
        if (direction === "down" || direction === "right") {
          if (s.hIdx < 7) {
            dispatch(setHIdx(s.hIdx + 1));
            acted = true;
          }
        } else if (direction === "up" || direction === "left") {
          if (s.hIdx > 0) {
            dispatch(setHIdx(s.hIdx - 1));
            acted = true;
          } else if (s.hIdx === 0) {
            dispatch(setPhase(0));
            dispatch(setVIdx(3));
            acted = true;
          }
        }
      }

      if (acted) {
        dispatch(lockNav());
        setTimeout(() => dispatch(unlockNav()), NAV_LOCK_MS);
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (Math.max(absX, absY) < WHEEL_THRESHOLD) return;

      if (stateRef.current.phase === 0) {
        if (e.deltaY > 0) advance("down");
        else if (e.deltaY < 0) advance("up");
      } else {
        if (absX > absY) {
          if (e.deltaX > 0) advance("right");
          else if (e.deltaX < 0) advance("left");
        } else {
          if (e.deltaY > 0) advance("right");
          else if (e.deltaY < 0) advance("left");
        }
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      const dx = (e.changedTouches[0].clientX - touchStartX) * -1;
      const dy = (e.changedTouches[0].clientY - touchStartY) * -1;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (Math.max(absX, absY) < TOUCH_THRESHOLD) return;

      if (stateRef.current.phase === 0) {
        if (dy > 0) advance("down");
        else advance("up");
      } else {
        if (absX > absY) {
          if (dx > 0) advance("right");
          else advance("left");
        } else {
          if (dy > 0) advance("right");
          else advance("left");
        }
      }
    };

    const onKey = (e) => {
      switch (e.key) {
        case "ArrowDown":
        case "s":
        case "S":
          advance("down");
          break;
        case "ArrowUp":
        case "w":
        case "W":
          advance("up");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          advance("right");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          advance("left");
          break;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [dispatch]);
}
