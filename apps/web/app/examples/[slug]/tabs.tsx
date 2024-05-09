"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./styles.module.scss";
import { ReactNode, useCallback, Children } from "react";
import { Code } from "@/examples";
import { Button } from "ui/button";

export function Tabs(props: {
  sources: Code[];
  children?: ReactNode;
}): JSX.Element {
  const params = useSearchParams();
  const file = params.get("showFile") ?? "0";
  const show = params.get("showCode") === "true";
  const router = useRouter();
  const pathname = usePathname();

  const changeFile = useCallback(
    (fileIdx: number) => {
      const newParams = new URLSearchParams(params);
      newParams.set("showFile", fileIdx.toString());

      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    },
    [router, pathname, params],
  );

  return (
    <div className={`${styles["code-overlay"]} ${show ? styles.show : ""}`}>
      <div className={styles.tabs}>
        {props.sources.map((code, i) => (
          <Button
            small
            bare
            className={file === i.toString() ? styles.active : ""}
            key={code.filename}
            onClick={() => {
              changeFile(i);
            }}
          >
            {code.filename}
          </Button>
        ))}
      </div>

      <div className={styles.source}>
        {Children.map(props.children, (child, i) => {
          let classes = styles["source-text"];
          if (file === i.toString()) {
            classes += ` ${styles.show}`;
          }

          return <div className={classes}>{child}</div>;
        })}
      </div>
    </div>
  );
}
