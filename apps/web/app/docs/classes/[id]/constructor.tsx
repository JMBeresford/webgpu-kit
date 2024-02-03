import type { JSONOutput as J } from "typedoc";
import { ParameterList } from "@/components/docs/parameter-list";

export function Constructor(props: {
  reflection: J.DeclarationReflection;
}): JSX.Element {
  const params = parseParameters(props.reflection);

  return (
    <div>
      <code>{props.reflection.name}</code>

      <ParameterList parameters={params} />
    </div>
  );
}

function parseParameters(
  reflection: J.DeclarationReflection,
): J.ParameterReflection[] {
  if (reflection.signatures === undefined) {
    throw new Error(
      `Expected reflection to have signatures, got: ${JSON.stringify(
        reflection,
      )}`,
    );
  }

  if (reflection.signatures.length > 1) {
    throw new Error(
      `Expected reflection to have only 1 signature, got: ${JSON.stringify(
        reflection.signatures,
      )}`,
    );
  }

  const signature = reflection.signatures[0];
  return signature.parameters || [];
}
