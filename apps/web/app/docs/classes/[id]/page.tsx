import type { JSONOutput as J } from "typedoc";
import { ReflectionKind } from "typedoc";
import { getReflectionsByKind, getReflectionsById } from "../../utils";
import { Constructor } from "./constructor";
import { Property } from "./property";

type Params = {
  id: string;
};

export default function Page(props: { params: Params }): JSX.Element {
  const reflection = getReflectionsById(parseInt(props.params.id));

  if (!reflection) {
    throw new Error(`Reflection not found for id: ${props.params.id}`);
  }

  const description = parseDescription(reflection);
  const ctor = parseConstructor(reflection);
  const properties = parseProperties(reflection);

  return (
    <div>
      <h1>{reflection.name}</h1>
      <h3>{description}</h3>

      {ctor ? <Constructor reflection={ctor} /> : null}

      <h3>Properties</h3>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {properties.map((prop) => (
          <Property key={prop.id} reflection={prop} />
        ))}
      </div>
      <p style={{ whiteSpace: "pre" }}>
        {(reflection.groups || []).map((g) => g.title).join("\n")}
      </p>
    </div>
  );
}

export function generateStaticParams(): Params[] {
  return getReflectionsByKind(ReflectionKind.Class).map((reflection) => ({
    id: reflection.id.toString(),
  }));
}

function parseDescription(reflection: J.DeclarationReflection): string {
  let description = "";

  for (const summary of reflection.comment?.summary || []) {
    switch (summary.kind) {
      case "text":
        description += summary.text;
        break;
      default:
        // TODO: Handle other kinds of comments when encountered
        throw new Error(`Unexpected comment kind: ${summary.kind}`);
    }
  }

  return description;
}

function parseConstructor(
  reflection: J.DeclarationReflection,
): J.DeclarationReflection | undefined {
  for (const child of reflection.children || []) {
    if (child.kind === ReflectionKind.Constructor) {
      return child;
    }
  }
}

function parseProperties(
  reflection: J.DeclarationReflection,
): J.DeclarationReflection[] {
  return (
    reflection.children?.filter(
      (child) =>
        child.kind === ReflectionKind.Property &&
        !child.flags.isPrivate &&
        !child.flags.isProtected &&
        !child.name.startsWith("_"),
    ) || []
  );
}
