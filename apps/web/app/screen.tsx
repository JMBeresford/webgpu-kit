"use client";

import { useRef } from "react";
import { usePageScroll } from "../hooks/use-page-scroll";
import styles from "./styles.module.scss";

export function Screen(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const scrolled = usePageScroll({ threshold: 750, relativeToViewport: true });

  return (
    <div
      className={styles.screen}
      ref={ref}
      style={{ opacity: scrolled ? 1 : 0 }}
    />
  );
}
