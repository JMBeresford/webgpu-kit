import { type JSONOutput as J } from "typedoc";
import docsJson from "docs";

export const project = docsJson as J.ProjectReflection;
export const readme = project.readme;

// redeclared enum to avoid importing from typedoc, which includes
// methods that are not serializable and cause issues when sent to the client
export enum ReflectionKind {
  Project = 1,
  Module = 2,
  Namespace = 4,
  Enum = 8,
  EnumMember = 16,
  Variable = 32,
  Function = 64,
  Class = 128,
  Interface = 256,
  Constructor = 512,
  Property = 1024,
  Method = 2048,
  CallSignature = 4096,
  IndexSignature = 8192,
  ConstructorSignature = 16384,
  Parameter = 32768,
  TypeLiteral = 65536,
  TypeParameter = 131072,
  Accessor = 262144,
  GetSignature = 524288,
  SetSignature = 1048576,
  TypeAlias = 2097152,
  Reference = 4194304,
}

if (process.env.NODE_ENV === "production") {
  const livePackages = ["Core"];
  project.children = project.children?.filter((child) => {
    return livePackages.includes(child.name);
  });
}

if (!project.children) {
  throw new Error("No children found in project");
}

function selectFromTree(
  selector: (n: J.DeclarationReflection) => boolean,
  root: J.DeclarationReflection | J.ProjectReflection,
): J.DeclarationReflection | undefined {
  if (root === undefined) {
    return;
  }

  if (root.variant === "declaration" && selector(root)) {
    return root;
  }

  if (root.children) {
    for (const child of root.children) {
      const found = selectFromTree(selector, child);
      if (found) {
        return found;
      }
    }
  }
}

function selectAllFromTree(
  selector: (n: J.DeclarationReflection) => boolean,
  root: J.DeclarationReflection | J.ProjectReflection,
): J.DeclarationReflection[] {
  const results: J.DeclarationReflection[] = [];

  if (root === undefined) {
    return results;
  }

  if (root.variant === "declaration" && selector(root)) {
    results.push(root);
  }

  if (root.children) {
    for (const child of root.children) {
      results.push(...selectAllFromTree(selector, child));
    }
  }

  return results;
}

export const allReflections = selectAllFromTree((_n) => true, project);
export const allGroups = new Map<string, string[]>();
allReflections.forEach((reflection) => {
  if (reflection.groups) {
    reflection.groups.forEach((group) => {
      if (!allGroups.has(group.title)) {
        allGroups.set(group.title, []);
      }

      allGroups.get(group.title)?.push(reflection.id.toString());
    });
  }
});

export function getReflectionsByKind(
  kind: ReflectionKind,
): J.DeclarationReflection[] {
  return selectAllFromTree((n) => n.kind === kind, project);
}

export function getReflectionById(
  id: number,
): J.DeclarationReflection | undefined {
  return selectFromTree((n) => n.id === id, project);
}

export function getLinkForType(type?: J.SomeType): string | undefined {
  if (!type) {
    return undefined;
  }

  switch (type.type) {
    case "reference":
      return getLinkForReference(type);
    case "reflection":
      return getLinkForDeclaration(type.declaration);
    case "array":
      return getLinkForType(type.elementType);
    case "intrinsic":
    case "union":
    case "intersection":
    case "conditional":
    case "indexedAccess":
    case "tuple":
    case "query":
    case "predicate":
    case "rest":
    case "optional":
    case "unknown":
    case "inferred":
    case "literal":
    case "mapped":
    case "templateLiteral":
    case "namedTupleMember":
    case "typeOperator":
      return undefined;
  }
}

export function getNameForType(type?: J.SomeType): string | undefined {
  if (!type) {
    return undefined;
  }

  switch (type.type) {
    case "reference":
      if (typeof type.target !== "number") {
        return type.target.qualifiedName;
      }
      return type.name;

    case "array":
      return `${getNameForType(type.elementType)}[]`;

    case "intrinsic":
      return type.name;

    case "union":
      return type.types.map(getNameForType).join(" | ");

    case "literal":
      switch (typeof type.value) {
        case "string":
          return `"${type.value}"`;
        case "number":
          return type.value.toString();
        case "boolean":
          return type.value.toString();
        default:
          throw new Error(
            `Encountered unhandled literal type: ${JSON.stringify(type)}`,
          );
      }

    case "reflection":
      return undefined;

    case "unknown":
      return type.name;

    default:
      throw new Error(`Encountered unhandled type: ${JSON.stringify(type)}`);
  }
}

export function getLinkForReference(
  reflection: J.ReferenceType,
): string | undefined {
  if (typeof reflection.target !== "number") {
    return reflection.externalUrl;
  }

  const target = getReflectionById(reflection.target);
  if (target) {
    return getLinkForDeclaration(target);
  }

  return undefined;
}

export function getLinkForDeclaration(
  reflection?: J.DeclarationReflection,
): string | undefined {
  if (!reflection) {
    return undefined;
  }

  switch (reflection.kind) {
    case ReflectionKind.Class:
      return `/docs/classes/${reflection.id}`;
    case ReflectionKind.Interface:
      return `/docs/interfaces/${reflection.id}`;
    case ReflectionKind.Enum:
      return `/docs/enums/${reflection.id}`;
    case ReflectionKind.TypeAlias:
    case ReflectionKind.TypeLiteral:
      return `/docs/types/${reflection.id}`;
    case ReflectionKind.Module:
      return `/docs/modules/${reflection.id}`;
    case ReflectionKind.Variable:
      return `/docs/variables/${reflection.id}`;
    case ReflectionKind.Function:
      return `/docs/functions/${reflection.id}`;
    case ReflectionKind.Method:
    case ReflectionKind.Property:
    case ReflectionKind.EnumMember:
    case ReflectionKind.Parameter:
    case ReflectionKind.TypeParameter:
    case ReflectionKind.Accessor:
    case ReflectionKind.Constructor:
    case ReflectionKind.CallSignature:
    case ReflectionKind.IndexSignature:
    case ReflectionKind.GetSignature:
    case ReflectionKind.SetSignature:
    default:
      return undefined;
  }
}

export function parseConstructorSignatures(
  reflection: J.DeclarationReflection,
): J.SignatureReflection[] {
  const ctors =
    reflection.children?.filter(
      (child) => child.kind === ReflectionKind.Constructor,
    ) || [];

  return ctors.reduce((acc, constructor) => {
    if (constructor.signatures === undefined) {
      return acc;
    }

    return acc.concat(constructor.signatures);
  }, [] as J.SignatureReflection[]);
}

export function parseProperties(
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

export function parseMethodsSignatures(
  reflection: J.DeclarationReflection,
): J.SignatureReflection[] {
  const methods =
    reflection.children?.filter(
      (child) =>
        child.kind === ReflectionKind.Method &&
        !child.flags.isPrivate &&
        !child.flags.isProtected &&
        !child.name.startsWith("_"),
    ) || [];

  return methods.reduce((acc, method) => {
    if (method.signatures === undefined) {
      return acc;
    }

    return acc.concat(method.signatures);
  }, [] as J.SignatureReflection[]);
}
