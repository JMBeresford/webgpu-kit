import {
  getReflectionById,
  getReflectionsByKind,
  ReflectionKind,
} from "../../../reflection-utils";
import { CommentContent } from "../../../components/comment-content";
import { Property } from "@/app/docs/components/property";
import { renderTypeReflection } from "@/app/docs/highlighting-utils";
import { Code } from "@/app/docs/components/code";
import styles from "./type.module.scss";
import { Item } from "./item";

type Params = {
  id: string;
};

export function TypeView(props: { params: Params }): JSX.Element {
  const reflection = getReflectionById(parseInt(props.params.id));

  if (!reflection) {
    throw new Error(`Reflection not found for id: ${props.params.id}`);
  }

  if (!reflection.type) {
    throw new Error(
      `Expected reflection to have a type, got: ${JSON.stringify(reflection)}`,
    );
  }

  const { comment, name } = reflection;
  const renderedType = renderTypeReflection(reflection);

  function Common(): JSX.Element {
    return (
      <>
        <h1>{name}</h1>

        {comment !== undefined && <CommentContent comment={comment} />}
        <Code>{renderedType}</Code>
      </>
    );
  }

  if (reflection.type.type === "reflection") {
    const children =
      reflection.type.declaration.children?.filter(
        (child) =>
          !child.flags.isPrivate &&
          !child.flags.isProtected &&
          !child.name.startsWith("_"),
      ) || [];

    return (
      <div className={styles.type}>
        <Common />

        <div className={styles.group}>
          <h2>Properties</h2>

          {children.map((child) => (
            <Item key={child.id} className={styles.item}>
              <Property reflection={child} />
            </Item>
          ))}
        </div>
      </div>
    );
  }

  return <Common />;
}

export function generateStaticParams(): Params[] {
  return getReflectionsByKind(ReflectionKind.TypeAlias)
    .concat(getReflectionsByKind(ReflectionKind.TypeLiteral))
    .map((reflection) => ({
      id: reflection.id.toString(),
    }));
}
