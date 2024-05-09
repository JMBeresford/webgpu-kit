import { Code as SyntaxHighlighter } from "bright";
import type { Code } from "../../../examples";
import { Tabs } from "./tabs";
import { theme } from "@/components/bright-theme";
import * as prettier from "prettier";

type Props = {
  code: Code;
};

async function CodeBlock(props: Props): Promise<JSX.Element> {
  const parser = props.code.language.startsWith("ts")
    ? "typescript"
    : undefined;

  const code = parser
    ? await prettier.format(props.code.text, { parser, useTabs: true })
    : props.code.text;

  return (
    <SyntaxHighlighter lang={props.code.language} lineNumbers theme={theme}>
      {code}
    </SyntaxHighlighter>
  );
}

export function CodeOverlay(props: { sources: Code[] }): JSX.Element {
  return (
    <div>
      <Tabs sources={props.sources}>
        {props.sources.map((code) => (
          <div key={code.filename}>
            <CodeBlock code={code} />
          </div>
        ))}
      </Tabs>
    </div>
  );
}
