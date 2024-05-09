import { ExternalLinkIcon } from "@/components/external-link-icon";
import Link from "next/link";
import { ComponentProps } from "react";
import styles from "./doc-link.module.scss";

type LinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export default function DocLink(props: LinkProps): JSX.Element {
  const isExternal = isExternalLink(props.href);
  const { className, ...rest } = props;

  const classes = `${className} ${styles.link}`;

  return (
    <Link
      className={classes}
      target={isExternal ? "_blank" : undefined}
      {...rest}
    >
      {props.children}
      {isExternal && <ExternalLinkIcon />}
    </Link>
  );
}

function isExternalLink(href: string): boolean {
  return href.startsWith("http");
}
