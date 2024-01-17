import Link from "next/link";
import { ButtonGroup, Button } from "ui/button";
import { Card, CardTitle } from "ui/card";
import { Scene } from "../scene";
import { ExternalLinkIcon } from "../components/external-link-icon";
import styles from "./styles.module.scss";
import { Screen } from "./screen";

export default function Page(): JSX.Element {
  return (
    <>
      <Scene id={styles.scene} />
      <Screen />

      <main className={styles.hero}>
        <h1>The power of modern web graphics. In the palm of your hand.</h1>

        <p>
          WGPU-Kit is a collection of libraries that make it easy to build
          high-performance, cross-platform, web-based graphics applications.
        </p>

        <ButtonGroup className={styles.buttons}>
          <Link href="/docs">
            <Button primary>Explore WGPU-Kit</Button>
          </Link>

          <Link className={styles.button} href="/examples">
            <Button>View the Examples</Button>
          </Link>
        </ButtonGroup>
      </main>

      <section className={styles.why}>
        <main>
          <h2>Why Choose WGPU-Kit?</h2>

          <p>
            WGPU-Kit is built on the foundation of WebGPU, the next generation
            of web graphics. This low-level graphics API harnesses the power of
            modern GPU hardware, enabling visually rich and interactive
            applications that push the boundaries of what&apos;s possible in a
            browser.
          </p>

          <p>
            With WGPU-Kit, you get the combined power of WebGPU&apos;s
            future-proof technology and a library designed to make it easy to
            leverage that power.
          </p>
        </main>

        <aside>
          <h4>Read more:</h4>

          <ul>
            <li>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API"
                rel="noopener"
                target="_blank"
              >
                What is WebGPU?
                <ExternalLinkIcon />
              </a>
            </li>
            <li>
              <a
                href="https://developer.chrome.com/blog/from-webgl-to-webgpu"
                rel="noopener"
                target="_blank"
              >
                From WebGL to WebGPU
                <ExternalLinkIcon />
              </a>
            </li>

            <li>
              <a
                href="https://www.w3.org/TR/webgpu/"
                rel="noopener"
                target="_blank"
              >
                The WebGPU spec
                <ExternalLinkIcon />
              </a>
            </li>

            <li>
              <a
                href="https://www.w3.org/TR/WGSL/"
                rel="noopener"
                target="_blank"
              >
                The WGSL spec
                <ExternalLinkIcon />
              </a>
            </li>
          </ul>
        </aside>
      </section>

      <hr className={styles.rule} />

      <section className={styles.cards}>
        <Card>
          <CardTitle>Streamlined Development</CardTitle>
          <p>
            WGPU-Kit minimizes the need for repetitive code by providing
            sensible defaults. However, it still allows for detailed
            configuration akin to raw WebGPU code when necessary.
          </p>
        </Card>
        <Card>
          <CardTitle>Harness the Power of Modern GPUs</CardTitle>
          <p>
            With WGPU-Kit, you&apos;re no longer constrained by outdated GPU
            APIs. Embrace the power of modern graphics workflows without any
            compromises or workarounds.
          </p>
        </Card>
        <Card>
          <CardTitle>Simplified API with Pipeline Groups</CardTitle>
          <p>
            WGPU-Kit&apos;s simple API allows you to group both render pipelines
            and compute pipelines by shared resources, streamlining your
            workflow.
          </p>
        </Card>
        <Card>
          <CardTitle>Flexible Levels of Abstraction</CardTitle>
          <p>
            Whether you need full control over pipeline creation, shader code,
            and operational control, or you prefer a simple, conventional scene
            graph for a straightforward renderer, WGPU-Kit has you covered.
          </p>
        </Card>
      </section>
    </>
  );
}
