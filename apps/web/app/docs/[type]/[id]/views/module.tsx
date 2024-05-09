import { JSONOutput as J } from "typedoc";
import styles from "./module.module.scss";
import {
  getLinkForDeclaration,
  getReflectionById,
  getReflectionsByKind,
  ReflectionKind,
} from "@/app/docs/reflection-utils";
import DocLink from "../../../components/doc-link";
import { Readme } from "@/app/docs/components/readme";

type Params = {
  id: string;
};

export function ModuleView(props: { params: Params }): JSX.Element {
  const reflection = getReflectionById(parseInt(props.params.id));

  if (reflection === undefined) {
    throw new Error(`Reflection not found for id: ${props.params.id}`);
  }

  if (!reflection.groups) {
    throw new Error(
      `Expected reflection to have groups, got: ${JSON.stringify(reflection)}`,
    );
  }

  return (
    <div className={styles.module}>
      {reflection.readme ? (
        <Readme readme={reflection.readme} />
      ) : (
        <h1>{reflection.name}</h1>
      )}

      {reflection.groups.map((group) => (
        <div key={group.title} className={styles.group}>
          <h2>{group.title}</h2>

          {group.children
            ?.map(getReflectionById)
            .map((child) =>
              child ? <ModuleChild key={child.id} reflection={child} /> : null,
            )}
        </div>
      ))}
    </div>
  );
}

export async function generateStaticParams(): Promise<Params[]> {
  return getReflectionsByKind(ReflectionKind.Module).map((reflection) => ({
    id: reflection.id.toString(),
  }));
}

function ModuleChild(props: {
  reflection: J.DeclarationReflection;
}): JSX.Element {
  const { reflection } = props;
  const link = getLinkForDeclaration(reflection) || "";

  return (
    <DocLink href={link}>
      <div className={styles.groupItem}>
        <h3>{reflection.name}</h3>
        <h4>{ReflectionKind[reflection.kind]}</h4>
      </div>
    </DocLink>
  );
}
