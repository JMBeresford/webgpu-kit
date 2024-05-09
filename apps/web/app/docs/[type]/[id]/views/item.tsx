import styles from "./item.module.scss";

export function Item(props: JSX.IntrinsicElements["div"]): JSX.Element {
  const { className, ...rest } = props;

  const classes = `${className} ${styles.item}`;

  return <div className={classes} {...rest} />;
}
