import { JSONOutput as J } from "typedoc";
import { getLinkForType, getNameForType } from "../reflection-utils";
import DocLink from "./doc-link";
import { Fragment } from "react";

export function TypeAnnotation(props: { type?: J.SomeType }): JSX.Element {
  const typeReflection = props.type;
  if (typeReflection === undefined) {
    return <code>void</code>;
  }

  const link = getLinkForType(typeReflection);
  const name = getNameForType(typeReflection);
  const typeArgs =
    typeReflection.type === "reference"
      ? typeReflection.typeArguments
      : undefined;

  switch (typeReflection.type) {
    case "union":
      return <UnionTypesView types={typeReflection.types} />;
    case "reflection":
      return (
        <code>
          {link !== undefined ? <DocLink href={link} /> : name}
          <code>{"{\n\t"}</code>
          {typeReflection.declaration.children?.map((child) => (
            <code>
              <code>{child.name}</code>
              <code>: </code>
              <TypeAnnotation type={child.type} />
              <code>{";\n"}</code>
            </code>
          ))}
          <code>{"}"}</code>
        </code>
      );
    default:
      return (
        <code>
          {link !== undefined ? <DocLink href={link}>{name}</DocLink> : name}
          {typeArgs !== undefined ? (
            <code>
              <code>&lt;</code>
              {typeArgs.map((arg) => (
                <TypeAnnotation type={arg} />
              ))}
              <code>&gt;</code>
            </code>
          ) : null}
        </code>
      );
  }
}

function UnionTypesView(props: { types: J.SomeType[] }): JSX.Element {
  const { types } = props;
  return (
    <Fragment>
      {types.map((type, i) => (
        <Fragment key={i}>
          <TypeAnnotation type={type} />
          {i < types.length - 1 ? <code> | </code> : null}
        </Fragment>
      ))}
    </Fragment>
  );
}
