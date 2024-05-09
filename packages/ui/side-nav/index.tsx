import { forwardRef } from "react";
import type { ForwardedRef } from "react";
import styles from "./side-nav.module.scss";

type Props = JSX.IntrinsicElements["div"];

function SideNavImpl(
  props: Props,
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  const { children, className, ...rest } = props;

  let classes = styles["side-nav"];
  if (className) {
    classes += ` ${className}`;
  }

  return (
    <div {...rest} className={classes} ref={ref}>
      {children}
    </div>
  );
}

type GroupProps = { HeaderSlot?: JSX.Element } & JSX.IntrinsicElements["ul"];

function SideNavGroupImpl(
  props: GroupProps,
  ref: ForwardedRef<HTMLUListElement>,
): JSX.Element {
  const { children, HeaderSlot, className, ...rest } = props;

  let classes = styles["side-nav-group"];
  if (className) {
    classes += ` ${className}`;
  }

  return (
    <>
      {HeaderSlot}
      <ul {...rest} className={classes} ref={ref}>
        {children}
      </ul>
    </>
  );
}

function SideNavItemImpl(
  props: JSX.IntrinsicElements["li"],
  ref: ForwardedRef<HTMLLIElement>,
): JSX.Element {
  const { children, className, ...rest } = props;

  let classes = styles["side-nav-item"];
  if (className) {
    classes += ` ${className}`;
  }

  return (
    <li {...rest} className={classes} ref={ref}>
      {children}
    </li>
  );
}

export const SideNav = forwardRef(SideNavImpl);
export const SideNavGroup = forwardRef(SideNavGroupImpl);
export const SideNavItem = forwardRef(SideNavItemImpl);
