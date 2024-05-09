import { ReflectionKind } from "@/app/docs/reflection-utils";
import {
  getReflectionById,
  getReflectionsByKind,
} from "../../../reflection-utils";
import { Signature } from "../../../components/signature";
import styles from "./function.module.scss";
import { Item } from "./item";

type Params = {
  id: string;
};

export function FunctionView(props: { params: Params }): JSX.Element {
  const reflection = getReflectionById(parseInt(props.params.id));

  if (reflection === undefined) {
    throw new Error(`Reflection not found for id: ${props.params.id}`);
  }

  const signatures = reflection.signatures || [];

  return (
    <div className={styles.group}>
      <h1>{reflection.name}</h1>

      {signatures.map((signature) => (
        <Item key={signature.id} className={styles.item}>
          <Signature signature={signature} />
        </Item>
      ))}
    </div>
  );
}

export function generateStaticParams(): Params[] {
  return getReflectionsByKind(ReflectionKind.Module).map((reflection) => ({
    id: reflection.id.toString(),
  }));
}
