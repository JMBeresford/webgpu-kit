import type { ReactNode } from "react";
import { Footer, FooterColumn } from "ui/footer";
import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import "./main.scss";
import { ExternalLinkIcon } from "../components/external-link-icon";
import { DesktopHeader, MobileHeader } from "./header";

export default function Layout(props: { children: ReactNode }): JSX.Element {
  return (
    <html className={GeistSans.className} lang="en">
      <body>
        <div id="root">
          <DesktopHeader />
          <MobileHeader />

          <div id="content">{props.children}</div>

          <Footer id="root-footer">
            <FooterColumn>
              <h1>WebGPU-kit</h1>

              <p>
                A minimal webGPU toolkit for rendering and compute pipelines
              </p>
            </FooterColumn>

            <FooterColumn>
              <h3>Navigation</h3>

              <ul>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/examples">Examples</Link>
                </li>
                <li>
                  <a
                    href="https://github.com/JMBeresford/webgpu-kit"
                    rel="noopener"
                    target="_blank"
                  >
                    GitHub
                    <ExternalLinkIcon />
                  </a>
                </li>

                <li>
                  <Link href="/docs">API</Link>
                </li>
              </ul>
            </FooterColumn>

            <FooterColumn>
              <h3>Learn More</h3>

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
            </FooterColumn>

            <FooterColumn>
              <h3>Get in touch</h3>

              <ul>
                <li>
                  <a
                    href="https://github.com/JMBeresford/webgpu-kit/issues?q=is:issue+is:open+sort:updated-desc"
                    rel="noopener"
                    target="_blank"
                  >
                    Report an Issue
                  </a>
                </li>

                <li>
                  <a
                    href="https://github.com/JMBeresford/webgpu-kit/blob/main/CONTRUBUTING.md"
                    rel="noopener"
                    target="_blank"
                  >
                    Contribute
                  </a>
                </li>
              </ul>
            </FooterColumn>
          </Footer>
        </div>
      </body>
    </html>
  );
}
