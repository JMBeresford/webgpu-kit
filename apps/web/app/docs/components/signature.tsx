import { JSONOutput as J } from "typedoc";
import { CommentContent } from "./comment-content";
import { renderSignature } from "../highlighting-utils";
import { Code } from "./code";
import styles from "./reflections.module.scss";

export function Signature(props: {
  signature: J.SignatureReflection;
  showName?: boolean;
}): JSX.Element {
  const { comment } = props.signature;
  const renderedSignature = renderSignature(props.signature);

  return (
    <div className={styles.reflection}>
      <Code>{renderedSignature}</Code>

      {comment !== undefined && <CommentContent comment={comment} />}
    </div>
  );
}
