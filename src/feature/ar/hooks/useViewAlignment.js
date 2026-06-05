"use client";

/**
 * Simplified alignment hook. Since we no longer require a centering outline silhouette,
 * this hook immediately registers as locked (active) so that customizations can be
 * applied instantly onto detected car parts.
 */
export default function useViewAlignment(
  carMask,
  bbox,
  videoRef,
  containerRef,
  selectedView,
) {
  return {
    alignScore: 1.0,
    isLocked: true,
    overlayBox: null,
    unlock: () => {},
  };
}
