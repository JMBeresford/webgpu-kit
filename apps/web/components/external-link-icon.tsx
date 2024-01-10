import type { ComponentProps } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

type Props = ComponentProps<typeof FaExternalLinkAlt>;

export function ExternalLinkIcon({ style, ...props }: Props): JSX.Element {
  return (
    <FaExternalLinkAlt
      size="0.7em"
      style={{
        verticalAlign: "top",
        marginLeft: "0.25em",
        opacity: 0.5,
        ...style,
      }}
      {...props}
    />
  );
}
