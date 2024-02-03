import type { ReactNode } from "react";
import { ReflectionKind } from "typedoc";
import Link from "next/link";
import { getReflectionsByKind } from "../../utils";

export default function Layout(props: { children: ReactNode }): JSX.Element {
  const classReflections = getReflectionsByKind(ReflectionKind.Class);
  return (
    <div>
      <nav>
        <ul>
          {classReflections.map((reflection) => (
            <li key={reflection.id}>
              <Link href={`/docs/classes/${reflection.id}`}>
                {reflection.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {props.children}
    </div>
  );
}
