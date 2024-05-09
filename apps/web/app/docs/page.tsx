import { Readme } from "./components/readme";
import { readme } from "./reflection-utils";

export default function Page(): JSX.Element {
  return (
    <div>
      <h1>Docs</h1>
      {readme && <Readme readme={readme} />}
    </div>
  );
}
