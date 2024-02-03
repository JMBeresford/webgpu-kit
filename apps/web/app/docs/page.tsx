import { ReflectionKind } from "typedoc";
import type { JSONOutput } from "typedoc";
import docsJson from "docs";

export default function Page(): JSX.Element {
  const json = docsJson as JSONOutput.ProjectReflection;

  function getNavContent(): string {
    let content = "";
    for (const group of json.groups ?? []) {
      content += `${group.title}\n`;
      for (const child of group.children ?? []) {
        content += `\t${json.symbolIdMap[child].qualifiedName}\n`;
      }
    }

    return content;
  }

  function getSpecificContent(): string {
    let content = "";
    for (const child of json.children ?? []) {
      switch (child.kind) {
        case ReflectionKind.Class:
          content += `Class: ${child.name}\n`;
          content += `${JSON.stringify(child, null, 4)}\n)}`;
          break;
        case ReflectionKind.Interface:
          content += `Interface: ${child.name}\n`;
          break;
        case ReflectionKind.Enum:
          content += `Enum: ${child.name}\n`;
          break;
        case ReflectionKind.Function:
          content += `Function: ${child.name}\n`;
          break;
        case ReflectionKind.Variable:
          content += `Variable: ${child.name}\n`;
          break;
        case ReflectionKind.TypeAlias:
          content += `TypeAlias: ${child.name}\n`;
          break;
        default:
          content += `${child.kind}: ${child.name}\n`;
          break;
      }
    }

    return content;
  }

  return (
    <div>
      <h1>Docs</h1>
      <p>{json.name}</p>

      <p style={{ whiteSpace: "pre" }}>{getNavContent()}</p>
      <p style={{ whiteSpace: "pre" }}>{getSpecificContent()}</p>
    </div>
  );
}
