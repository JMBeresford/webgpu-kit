"use client";

import { usePathname } from "next/navigation";
import { usePageScroll } from "../hooks/use-page-scroll";
import styles from "./styles.module.scss";

export function HeaderScreen(): JSX.Element {
  const pathname = usePathname();
  const scrolled = usePageScroll({
    threshold: pathname.startsWith("/docs") ? -1 : undefined,
  });

  return (
    <div
      className={styles["header-screen"]}
      style={{ opacity: scrolled ? 1 : 0 }}
    />
  );
}
