import { Extension } from "bright";
import { JSONOutput as J } from "typedoc";
import DocLink from "./components/doc-link";
import {
  ReflectionKind,
  getLinkForDeclaration,
  getLinkForType,
  getNameForType,
} from "./reflection-utils";

export type LinkAnnotation = {
  start: number;
  end: number;
  link: string;
};

// Annotate code inline with links to respective declarations
// when links are available.
//
// Example:
//
// ```ts
// let myclass1: ///start[https://example.com/MyClass]MyClass///end = new MyClass();
// ```
//
// The above will be deserialized into a query that the Bright package
// can use within an extension to render code blocks with links.

export const START_SEP = "///start";
export const END_SEP = "///end";

export function encodeLinkAnnotation(str: string, link?: string): string {
  if (!link) {
    return str;
  }

  return `${START_SEP}[${link}]${str}${END_SEP}`;
}

export function decodeLinkAnnotations(str: string): string {
  const lines = str.split("\n");
  const decodedStr = lines.reduce((acc, line) => {
    const { linkAnnotations, decodedLine } = decodeLinkAnnotationsInLine(line);

    const renderedAnnotations = linkAnnotations
      .map((a) => {
        const link = a.link;
        const start = a.start;
        const end = a.end;

        return `// link[${start}:${end}] ${link}`;
      })
      .join("\n");

    return `${acc}\n${
      renderedAnnotations && renderedAnnotations + "\n"
    }${decodedLine}`.trim();
  }, "");

  return decodedStr;
}

export function decodeLinkAnnotationsInLine(line: string): {
  linkAnnotations: LinkAnnotation[];
  decodedLine: string;
} {
  const linkAnnotations: LinkAnnotation[] = [];
  let decodedLine = "";

  if (!line.includes(START_SEP)) {
    return { linkAnnotations, decodedLine: line };
  }

  const start = line.indexOf(START_SEP);
  const end = line.indexOf(END_SEP);
  if (end === -1) {
    throw new Error(`Invalid link annotation: ${line}`);
  }

  const linkStart = line.indexOf("[", start) + 1;
  const linkEnd = line.indexOf("]", linkStart);
  const link = line.slice(linkStart, linkEnd);
  const textStart = linkEnd + 1;
  const text = line.slice(textStart, end);

  const linkAnnotation: LinkAnnotation = {
    start: start + 1,
    end: start + text.length,
    link,
  };

  linkAnnotations.push(linkAnnotation);

  decodedLine += line.slice(0, start);
  decodedLine += text;

  const remainingLine = line.slice(end + END_SEP.length);
  const {
    linkAnnotations: remainingLinkAnnotations,
    decodedLine: remainingDecodedLine,
  } = decodeLinkAnnotationsInLine(remainingLine);

  linkAnnotations.push(
    ...remapLinkAnnotations(remainingLinkAnnotations, decodedLine.length),
  );
  decodedLine += remainingDecodedLine;

  return { linkAnnotations, decodedLine };
}

export const linkExtension: Extension = {
  name: "link",

  InlineAnnotation: ({ children, query }) => (
    <DocLink href={query || ""} style={{ textDecoration: "underline" }}>
      {children}
    </DocLink>
  ),
};

export function remapLinkAnnotations(
  annotations: LinkAnnotation[],
  offset: number,
): LinkAnnotation[] {
  return annotations.map((a) => ({
    link: a.link,
    start: a.start + offset,
    end: a.end + offset,
  }));
}

export function renderTypeReflection(
  reflection: J.DeclarationReflection,
): string {
  const name = reflection.name;
  const link = getLinkForDeclaration(reflection);

  let renderedType = `type ${encodeLinkAnnotation(name, link)} = `;

  switch (reflection.kind) {
    case ReflectionKind.TypeAlias:
      renderedType += renderTypeAnnotation(reflection.type);

      break;
    default:
      break;
  }

  return decodeLinkAnnotations(renderedType);
}

export function renderProperty(reflection: J.DeclarationReflection): string {
  const renderedDeclaration = renderDeclaration(reflection);

  return decodeLinkAnnotations(renderedDeclaration);
}

export function renderSignature(reflection: J.SignatureReflection): string {
  let renderedSignature = reflection.name;

  const paramsList = renderParameterList(reflection.parameters || []);

  renderedSignature += `${paramsList}: ${renderTypeAnnotation(
    reflection.type,
  )}`;

  return decodeLinkAnnotations(renderedSignature);
}

export function renderParameterList(params: J.ParameterReflection[]): string {
  let paramsList = "(";

  for (const param of params) {
    if (param !== params[0]) {
      paramsList += ", ";
    }

    const renderedParam = renderDeclaration(param);

    paramsList += renderedParam;
  }

  paramsList += ")";

  return paramsList;
}

export function renderDeclaration(
  param: J.ParameterReflection | J.DeclarationReflection,
): string {
  const { name, type } = param;
  if (!type) {
    return `${name}: unknown`;
  }

  return `${name}: ${renderTypeAnnotation(type)}`;
}

export function renderTypeAnnotation(type?: J.SomeType): string {
  if (type?.type === "reflection") {
    return renderReflectionType(type);
  }

  if (type?.type === "intersection") {
    return renderChildrenTypes(type, "&");
  }

  if (type?.type === "union") {
    return renderChildrenTypes(type, "|");
  }

  const typeName = getNameForType(type);
  if (typeName === undefined) {
    return "unknown";
  }

  const link = getLinkForType(type);
  const args = type?.type === "reference" ? type.typeArguments : [];
  let renderedTypeAnnotation = encodeLinkAnnotation(typeName, link);

  if (args && args.length > 0) {
    renderedTypeAnnotation += "<";
    for (const arg of args) {
      const argName = getNameForType(arg);
      const argLink = getLinkForType(arg);

      if (argName === undefined) {
        throw new Error(
          `Expected a name for type, got: ${JSON.stringify(arg)}`,
        );
      }

      if (arg !== args[0]) {
        renderedTypeAnnotation += ", ";
      }

      renderedTypeAnnotation += encodeLinkAnnotation(argName, argLink);
    }

    renderedTypeAnnotation += ">";
  }

  return renderedTypeAnnotation;
}

export function renderReflectionType(type: J.ReflectionType): string {
  const children =
    type.declaration.children?.filter(
      (child) =>
        !child.flags.isPrivate &&
        !child.flags.isProtected &&
        !child.name.startsWith("_"),
    ) || [];

  let renderedType = `{\n`;

  for (const child of children) {
    const renderedDeclaration = renderDeclaration(child);

    renderedType += `\t${renderedDeclaration};\n`;
  }

  renderedType += "}";
  return renderedType;
}

export function renderChildrenTypes(
  type: J.IntersectionType | J.UnionType,
  separator: "&" | "|",
): string {
  let renderedType = "";

  for (const member of type.types) {
    const renderedTypeAnnotation = renderTypeAnnotation(member);

    renderedType += `${renderedTypeAnnotation}`;

    if (member !== type.types[type.types.length - 1]) {
      renderedType += ` ${separator} `;
    }
  }

  return renderedType;
}
