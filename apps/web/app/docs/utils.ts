import type { JSONOutput } from "typedoc";
import { ReflectionKind } from "typedoc";
import docsJson from "docs";

const project = docsJson as JSONOutput.ProjectReflection;

export function getReflectionsByKind(
  kind: ReflectionKind,
): JSONOutput.DeclarationReflection[] {
  return (
    project.children?.filter((reflection) => reflection.kind === kind) || []
  );
}

export function getReflectionsById(
  id: number,
): JSONOutput.DeclarationReflection | undefined {
  return project.children?.find((reflection) => reflection.id === id);
}

export function getLinkForType(type: JSONOutput.SomeType): string {
  switch (type.type) {
    case "reference":
      return getLinkForReference(type);
    case "reflection":
      return getLinkForDeclaration(type.declaration);
    case "array":
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
      return "/404";
  }
}

export function getLinkForReference(
  reflection: JSONOutput.ReferenceType,
): string {
  if (typeof reflection.target !== "number") {
    return reflection.externalUrl || "/404";
  }

  const target = getReflectionsById(reflection.target);
  if (target) {
    return getLinkForDeclaration(target);
  }

  return "/404";
}

export function getLinkForDeclaration(
  reflection: JSONOutput.DeclarationReflection,
): string {
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
      return "/404";
  }
}
