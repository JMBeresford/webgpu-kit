import type { JSONOutput as J } from "typedoc";
import Link from "next/link";
import { getLinkForType } from "@/app/docs/utils";

export function ParameterList(props: {
  parameters: J.ParameterReflection[];
}): JSX.Element {
  return (
    <code>
      (
      {props.parameters.map((param) => (
        <Parameter key={param.id} parameter={param} />
      ))}
      )
    </code>
  );
}

export function Parameter(props: {
  parameter: J.ParameterReflection;
}): JSX.Element {
  const name = props.parameter.name;
  const type = props.parameter.type;

  return (
    <code>
      <code>{props.parameter.name}</code>
      {type ? <ParameterType name={name} type={type} /> : <code>{name}</code>}
    </code>
  );
}

function ParameterType(props: { type: J.SomeType; name: string }): JSX.Element {
  const link = getLinkForType(props.type);

  return (
    <code>
      <code>: </code>
      <code>
        <Link href={link}>{props.name}</Link>
      </code>
    </code>
  );
}
