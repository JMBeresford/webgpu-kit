"use client";
import { useEffect, useState } from "react";

export function usePageScroll(opts?: {
  threshold?: number;
  relativeToViewport?: boolean;
}): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const listener: () => void = () => {
      const threshold = opts?.threshold ?? 20;
      let scroll = window.scrollY;

      if (opts?.relativeToViewport) {
        scroll += window.innerHeight;
      }

      if (scroll >= threshold) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    listener();
    window.addEventListener("scroll", listener);
    window.addEventListener("resize", listener);

    return () => {
      window.removeEventListener("scroll", listener);
      window.removeEventListener("resize", listener);
    };
  }, [opts]);

  return scrolled;
}
