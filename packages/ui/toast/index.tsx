"use client";

import type { ForwardedRef } from "react";
import { useState, forwardRef } from "react";
import { Button } from "../button";
import styles from "./styles.module.scss";

type Props = {
  kind?: "error" | "info";
  title?: string;
  visible?: boolean;
} & Omit<JSX.IntrinsicElements["div"], "ref">;

const ClassNames: Record<NonNullable<Props["kind"]>, string> = {
  error: styles.error,
  info: styles.info,
};

function ToastImpl(
  {
    kind = "info",
    title,
    visible = true,
    children,
    className,
    ...props
  }: Props,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const [show, setShow] = useState(true);

  let classes = `${styles.toast} ${ClassNames[kind]}`;

  if (className) {
    classes += ` ${className}`;
  }
  if (show && visible) {
    classes += ` ${styles.show}`;
  }
  if (title) {
    classes += ` ${styles.withTitle}`;
  }

  return (
    <div className={classes} {...props} ref={ref}>
      {title ? <ToastTitle>{title}</ToastTitle> : null}
      {children}
      <button
        className={styles.innerBtn}
        onClick={() => {
          setShow(false);
        }}
        type="button"
      />
    </div>
  );
}

function ToastContentImpl(
  { className, ...props }: Omit<JSX.IntrinsicElements["p"], "ref">,
  ref: ForwardedRef<HTMLParagraphElement>,
): JSX.Element {
  let classes = styles.message;
  if (className) {
    classes += ` ${className}`;
  }

  return <p className={classes} {...props} ref={ref} />;
}

function ToastTitle({
  className,
  children,
  ...props
}: JSX.IntrinsicElements["h4"]): JSX.Element {
  let classes = styles.title;
  if (className) {
    classes += ` ${className}`;
  }

  return (
    <h4 className={classes} {...props}>
      {children}
    </h4>
  );
}

function ToastActionImpl(
  { className, ...props }: Omit<JSX.IntrinsicElements["button"], "ref">,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  let classes = styles.action;
  if (className) {
    classes += ` ${className}`;
  }

  return (
    <Button
      className={classes}
      outline
      small
      type="button"
      {...props}
      ref={ref}
    />
  );
}

export const Toast = forwardRef(ToastImpl);
export const ToastAction = forwardRef(ToastActionImpl);
export const ToastContent = forwardRef(ToastContentImpl);
