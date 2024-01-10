"use client";
import { useEffect, useState } from "react";

export function usePageScroll(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const listener: () => void = () => {
      const vh = window.innerHeight * 0.01;
      if (window.scrollY > threshold * vh) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    listener();
    window.addEventListener("scroll", listener);

    return () => {
      window.removeEventListener("scroll", listener);
    };
  }, [threshold]);

  return scrolled;
}
