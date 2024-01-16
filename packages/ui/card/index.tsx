import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import styles from "./styles.module.scss";

function CardImpl(
  props: Omit<JSX.IntrinsicElements["div"], "ref">,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const { children, className, ...rest } = props;

  const classes = `${styles.card} ${className}`;

  return (
    <div className={classes} ref={ref} {...rest}>
      <div className={styles.background} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}

function CardTitleImpl(
  props: Omit<JSX.IntrinsicElements["h2"], "ref">,
  ref: ForwardedRef<HTMLHeadingElement>,
): JSX.Element {
  const { children, className, ...rest } = props;

  const classes = `${styles.title} ${className}`;

  return (
    <h2 className={classes} ref={ref} {...rest}>
      {children}
    </h2>
  );
}

export const Card = forwardRef(CardImpl);
export const CardTitle = forwardRef(CardTitleImpl);
