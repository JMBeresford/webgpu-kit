import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import styles from "./styles.module.scss";

function FooterImpl(
  props: Omit<JSX.IntrinsicElements["footer"], "ref">,
  ref: ForwardedRef<HTMLElement>,
): JSX.Element {
  const { children, className, ...rest } = props;

  const classes = `${styles.footer} ${className}`;

  return (
    <footer className={classes} ref={ref} {...rest}>
      <div className={styles.wrapper}>{children}</div>
    </footer>
  );
}

function FooterColumnImpl(
  props: Omit<JSX.IntrinsicElements["div"], "ref">,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const { children, className, ...rest } = props;

  const classes = `${styles.column} ${className}`;

  return (
    <div className={classes} ref={ref} {...rest}>
      {children}
    </div>
  );
}

export const Footer = forwardRef(FooterImpl);
export const FooterColumn = forwardRef(FooterColumnImpl);
