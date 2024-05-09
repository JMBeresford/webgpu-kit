import { Code as CodeImpl } from "bright";
import { ComponentProps } from "react";
import { linkExtension } from "../highlighting-utils";
import styles from "./code.module.scss";

export function Code(props: ComponentProps<typeof CodeImpl>): JSX.Element {
  const { extensions = [], className, ...rest } = props;

  const classes = `${className ?? ""} ${styles.code}`;

  return (
    <CodeImpl
      className={classes}
      style={{ margin: 0 }}
      extensions={[linkExtension, ...extensions]}
      lang="ts"
      theme="poimandres"
      {...rest}
    />
  );
}
