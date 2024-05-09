import { Code } from "./code";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { JSONOutput as J } from "typedoc";
import styles from "./readme.module.scss";
import rehypeSlug from "rehype-slug";

export function Readme(props: { readme: J.CommentDisplayPart[] }): JSX.Element {
  const { readme } = props;

  return (
    <div className={styles.readme}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          code(props) {
            const { children, className } = props;
            const match = /language-(\w+)/.exec(className || "");
            return (
              <Code
                lang={match ? match[1] : undefined}
                lineNumbers
                theme={"poimandres"}
                className={`${className} ${styles.code}`}
              >
                {children}
              </Code>
            );
          },
        }}
      >
        {readme.map((part) => part.text).join("\n\n")}
      </Markdown>
    </div>
  );
}
