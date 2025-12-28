import { useState, useEffect } from "react";

/**
 * Hook to detect if the device is mobile/touch-capable
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768 || "ontouchstart" in window;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

/**
 * Hook to detect if device supports touch
 */
export function useHasTouch() {
  const [hasTouch, setHasTouch] = useState(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    setHasTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return hasTouch;
}

/**
 * Hook to get screen size breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<"xs" | "sm" | "md" | "lg" | "xl">(() => {
    if (typeof window === "undefined") return "lg";
    const width = window.innerWidth;
    if (width < 480) return "xs";
    if (width < 640) return "sm";
    if (width < 768) return "md";
    if (width < 1024) return "lg";
    return "xl";
  });

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 480) setBreakpoint("xs");
      else if (width < 640) setBreakpoint("sm");
      else if (width < 768) setBreakpoint("md");
      else if (width < 1024) setBreakpoint("lg");
      else setBreakpoint("xl");
    };

    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, []);

  return breakpoint;
}

