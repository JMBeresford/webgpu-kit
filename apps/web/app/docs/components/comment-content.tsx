import { JSONOutput as J } from "typedoc";
import { Code } from "./code";
import { getLinkForDeclaration, getReflectionById } from "../reflection-utils";
import DocLink from "./doc-link";

const CommentView: Record<
  J.CommentDisplayPart["kind"],
  (comment: J.CommentDisplayPart) => JSX.Element
> = {
  text: CommentText,
  code: CommentCode,
  "inline-tag": CommentInlineTag,
} as const;

export function CommentContent(props: { comment: J.Comment }): JSX.Element {
  const comment = props.comment;
  const parts = comment.summary;

  return (
    <div>
      {parts.map((part, i) => {
        const View = CommentView[part.kind];
        return <View key={i} {...part} />;
      })}
    </div>
  );
}

function CommentText(comment: J.CommentDisplayPart): JSX.Element {
  return <span>{comment.text}</span>;
}

function CommentCode(comment: J.CommentDisplayPart): JSX.Element {
  const text = comment.text;
  const lang = text.split("\n")[0].replace("```", "");
  const code = text
    .split("\n")
    .filter((line) => !line.startsWith("```"))
    .join("\n");

  return <Code lang={lang}>{code}</Code>;
}

function CommentInlineTag(comment: J.CommentDisplayPart): JSX.Element {
  const inline = comment as J.InlineTagDisplayPart;
  const { target, text } = inline;

  if (typeof target === "number") {
    const targetReflection = getReflectionById(target);
    const link = getLinkForDeclaration(targetReflection);

    if (link === undefined) {
      return <span>{text}</span>;
    }

    return <DocLink href={link}>{inline.text}</DocLink>;
  }

  return <span>{text}</span>;
}
