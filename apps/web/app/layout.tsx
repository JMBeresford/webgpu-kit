import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import { Header, HeaderTitle } from "ui/header";
import { Nav } from "ui/nav";
import "./main.scss";
import { Button } from "ui/button";
import { ExternalLinkIcon } from "../components/external-link-icon";
import { HeaderScreen } from "./header-screen";

export default function Layout(props: { children: ReactNode }): JSX.Element {
  return (
    <html className={GeistSans.className} lang="en">
      <body>
        <div id="root">
          <Header id="root-header">
            <HeaderTitle>
              <Link href="/"> WGPU-Kit </Link>
            </HeaderTitle>
            <Nav>
              <a
                href="https://jmberesford.github.io/wgpu-kit/"
                rel="noopener"
                target="_blank"
              >
                API
                <ExternalLinkIcon />
              </a>

              <a
                href="https://github.com/JMBeresford/wgpu-kit"
                rel="noopener"
                target="_blank"
              >
                Source
                <ExternalLinkIcon />
              </a>

              <Link href="/examples">
                <Button
                  primary
                  small
                  style={{ fontSize: "inherit", fontWeight: "inherit" }}
                >
                  Examples
                </Button>
              </Link>
            </Nav>
            <HeaderScreen />
          </Header>

          <div id="content">{props.children}</div>
        </div>
      </body>
    </html>
  );
}
