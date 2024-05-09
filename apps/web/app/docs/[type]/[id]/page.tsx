import { notFound } from "next/navigation";
import { allGroups } from "../../reflection-utils";
import { ClassView } from "./views/class";
import { FunctionView } from "./views/function";
import { ModuleView } from "./views/module";
import { TypeView } from "./views/type";

export type ViewParams = {
  type: string;
  id: string;
};

export type View = (props: { params: ViewParams }) => JSX.Element;

const views: Record<string, View | undefined> = {
  classes: ClassView,
  modules: ModuleView,
  types: TypeView,
  functions: FunctionView,
  methods: FunctionView,
};

export default function Page(props: { params: ViewParams }): JSX.Element {
  const type = normalizeTypeName(props.params.type);
  const View = views[type];

  if (!View) {
    console.error(`No view for type: ${type}`);
    notFound();
  }

  return (
    <div>
      <View params={props.params} />
    </div>
  );
}

export function generateStaticParams(): ViewParams[] {
  return Array.from(allGroups)
    .map(([type, ids]) =>
      ids.map((id) => ({ type: normalizeTypeName(type), id })),
    )
    .flat();
}

function normalizeTypeName(type: string): string {
  return type.toLowerCase().replaceAll(" ", "");
}
