"use client";

import { usePageScroll } from "../hooks/use-page-scroll";
import styles from "./styles.module.scss";

export function HeaderScreen(): JSX.Element {
  const scrolled = usePageScroll();

  return (
    <div
      className={styles["header-screen"]}
      style={{ opacity: scrolled ? 1 : 0 }}
    />
  );
}
