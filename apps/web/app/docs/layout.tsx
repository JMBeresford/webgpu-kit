import type { ReactNode } from "react";
import { Nav } from "./nav";
import styles from "./styles.module.scss";
import { Toast, ToastContent } from "ui/toast";
import Link from "next/link";
import { Button } from "ui/button";

export default function Layout(props: { children: ReactNode }): JSX.Element {
  return (
    <div className={styles.docs}>
      <Nav />
      <div className={styles.content}>{props.children}</div>

      <Toast>
        <ToastContent style={{ maxWidth: "30ch" }}>
          You are viewing the beta docs. You may find the legacy docs more
          helpful.
        </ToastContent>

        <Link
          style={{ zIndex: 20, textDecoration: "none" }}
          href={"/legacy/docs"}
        >
          <Button
            style={{
              fontSize: "0.9rem",
              fontWeight: "lighter",
              border: "1px solid #333",
            }}
            small
          >
            See Legacy Docs
          </Button>
        </Link>
      </Toast>
    </div>
  );
}
