import { Example } from "./example";
import styles from "./page.module.css";

export default function Page(): JSX.Element {
  return (
    <main className={styles.main}>
      <Example />
    </main>
  );
}
