import type { JSONOutput as J } from "typedoc";
import Link from "next/link";
import { getLinkForType } from "../../utils";

export function Property(props: {
  reflection: J.DeclarationReflection;
}): JSX.Element {
  const reflection = props.reflection;

  if (!reflection.type) {
    throw new Error(
      `Expected reflection to have a type, got: ${JSON.stringify(reflection)}`,
    );
  }

  const typeName = parseName(reflection);
  const link = getLinkForType(reflection.type);

  return (
    <code>
      <code>{reflection.name}</code>
      {reflection.flags.isOptional ? "?" : ""}
      <code>: </code>
      <code>
        <Link href={link}>{typeName}</Link>
      </code>
    </code>
  );
}

function parseName(reflection: J.DeclarationReflection): string {
  if (reflection.type?.type === "reference") {
    if (typeof reflection.type.target !== "number") {
      return reflection.type.target.qualifiedName;
    }
    return reflection.type.name;
  }

  if (reflection.type?.type === "intrinsic") {
    return reflection.type.name;
  }

  throw new Error(
    `Expected reflection to have a reference or intrinsic type, got: ${JSON.stringify(
      reflection.type,
    )}`,
  );
}
