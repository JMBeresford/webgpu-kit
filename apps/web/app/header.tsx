"use client";

import Link from "next/link";
import { Nav } from "ui/nav";
import { Button } from "ui/button";
import { Header, HeaderTitle } from "ui/header";
import { FaBarsStaggered, FaCircleXmark } from "react-icons/fa6";
import { useRef } from "react";
import { ExternalLinkIcon } from "../components/external-link-icon";
import { HeaderScreen } from "./header-screen";

export function DesktopHeader(): JSX.Element {
  return (
    <Header id="root-header">
      <HeaderTitle>
        <Link href="/"> WGPU-Kit </Link>
      </HeaderTitle>
      <Nav>
        <Link href="/docs">API</Link>

        <a
          href="https://github.com/JMBeresford/wgpu-kit"
          rel="noopener"
          target="_blank"
        >
          GitHub
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
  );
}

export function MobileHeader(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Header id="root-header-mobile" ref={ref}>
      <HeaderTitle>
        <Link href="/">WGPU-Kit</Link>
      </HeaderTitle>

      <button
        className="icons"
        onClick={() => {
          ref.current?.classList.toggle("open");
        }}
        type="button"
      >
        <FaBarsStaggered className="icon" />
        <FaCircleXmark className="icon" />
      </button>

      <Nav>
        <Link href="/docs">API</Link>
        <a
          href="https://github.com/JMBeresford/wgpu-kit"
          rel="noopener"
          target="_blank"
        >
          GitHub
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
  );
}
