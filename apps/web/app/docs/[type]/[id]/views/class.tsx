import {
  getReflectionById,
  parseConstructorSignatures,
  parseMethodsSignatures,
  parseProperties,
} from "@/app/docs/reflection-utils";
import { ViewParams } from "../page";
import { CommentContent } from "@/app/docs/components/comment-content";
import { Signature } from "@/app/docs/components/signature";
import { Property } from "@/app/docs/components/property";
import styles from "./class.module.scss";
import { Item } from "./item";

export function ClassView(props: { params: ViewParams }): JSX.Element {
  const { id } = props.params;
  const reflection = getReflectionById(parseInt(id));

  if (!reflection) {
    throw new Error(`Reflection not found for id: ${id}`);
  }

  const { comment } = reflection;

  const ctorSignatures = parseConstructorSignatures(reflection);
  const properties = parseProperties(reflection);
  const methodSignatures = parseMethodsSignatures(reflection);

  return (
    <main className={styles.class}>
      <div>
        <h1>{reflection.name}</h1>
        {comment !== undefined && <CommentContent comment={comment} />}
      </div>

      {ctorSignatures.length > 0 ? (
        <div className={styles.group}>
          <h3>Constructors</h3>

          {ctorSignatures.map((signature) => (
            <Item key={signature.id} className={styles.item}>
              <Signature signature={signature} />
            </Item>
          ))}
        </div>
      ) : null}

      {properties.length > 0 ? (
        <div className={styles.group}>
          <h3>Properties</h3>

          {properties.map((reflection) => (
            <Item key={reflection.id} className={styles.item}>
              <h3>{reflection.name}</h3>
              <Property reflection={reflection} />
            </Item>
          ))}
        </div>
      ) : null}

      {methodSignatures.length > 0 ? (
        <div className={styles.group}>
          <h3>Methods</h3>

          {methodSignatures.map((signature) => (
            <Item key={signature.id} className={styles.item}>
              <h3>{signature.name}</h3>
              <Signature signature={signature} showName />
            </Item>
          ))}
        </div>
      ) : null}
    </main>
  );
}
