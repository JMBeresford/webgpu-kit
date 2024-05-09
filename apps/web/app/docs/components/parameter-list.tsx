import type { JSONOutput as J } from "typedoc";
import { TypeAnnotation } from "./type-annotation";

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
  const { name, type } = props.parameter;

  return (
    <code>
      <code>{name}</code>
      {type !== undefined ? (
        <code>
          <code>: </code>
          <TypeAnnotation type={type} />
        </code>
      ) : null}
    </code>
  );
}
