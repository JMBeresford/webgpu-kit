import { JSONOutput as J } from "typedoc";
import { renderProperty } from "../highlighting-utils";
import { Code } from "./code";
import { CommentContent } from "./comment-content";
import styles from "./reflections.module.scss";

export function Property(props: {
  reflection: J.DeclarationReflection;
}): JSX.Element {
  const { comment } = props.reflection;
  const renderedProperty = renderProperty(props.reflection);

  return (
    <div className={styles.reflection}>
      <Code>{renderedProperty}</Code>

      {comment !== undefined && <CommentContent comment={comment} />}
    </div>
  );
}
