import { useState, useEffect, useCallback, useRef } from "react";

export default function useScrollNavigation(totalSections, enabled = true) {
  const [activeIndex, setActiveIndex] = useState(0);
  const indexRef = useRef(0);
  const lockRef = useRef(false);

  const navigateTo = useCallback(
    (idx) => {
      if (!enabled || lockRef.current) return;
      const clamped = Math.max(0, Math.min(totalSections - 1, idx));
      if (clamped === indexRef.current) return;
      lockRef.current = true;
      indexRef.current = clamped;
      setActiveIndex(clamped);
      window.dispatchEvent(
        new CustomEvent("landing:section", { detail: clamped })
      );
      setTimeout(() => {
        lockRef.current = false;
      }, 900);
    },
    [totalSections, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const onWheel = (e) => {
      if (lockRef.current) return;
      if (e.deltaY > 30) navigateTo(indexRef.current + 1);
      else if (e.deltaY < -30) navigateTo(indexRef.current - 1);
    };

    let tx = 0,
      ty = 0;
    const onTouchStart = (e) => {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (lockRef.current) return;
      const dy = ty - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 50)
        navigateTo(dy > 0 ? indexRef.current + 1 : indexRef.current - 1);
    };

    const onKeyDown = (e) => {
      if (e.key === "ArrowDown") navigateTo(indexRef.current + 1);
      else if (e.key === "ArrowUp") navigateTo(indexRef.current - 1);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled, navigateTo]);

  return { activeIndex, navigateTo };
}
