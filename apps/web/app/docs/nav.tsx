"use client";

import { JSONOutput as J } from "typedoc";
import { SideNav, SideNavGroup, SideNavItem } from "ui/side-nav";
import DocLink from "./components/doc-link";
import {
  getLinkForDeclaration,
  ReflectionKind,
  project,
} from "./reflection-utils";
import styles from "./styles.module.scss";
import { usePathname } from "next/navigation";

export function Nav(): JSX.Element {
  const packages = project.children || [];

  return (
    <SideNav className={styles.nav}>
      {packages.map((pkg) => (
        <SideNavGroup key={pkg.id} HeaderSlot={<NavGroupHeader node={pkg} />}>
          {filterChildren(pkg, pkg.name).map((child) => (
            <NavItem key={child.id} node={child} packageName={pkg.name} />
          ))}
        </SideNavGroup>
      ))}
    </SideNav>
  );
}

function NavGroupHeader(props: { node: J.DeclarationReflection }): JSX.Element {
  const { node } = props;
  const link = getLinkForDeclaration(node);

  if (!link) {
    throw new Error(`No link for ${node.name}`);
  }

  return (
    <h3>
      <DocLink href={link}>{node.name}</DocLink>
    </h3>
  );
}

function NavItem(props: {
  node: J.DeclarationReflection;
  packageName: string;
}): JSX.Element {
  const { node, packageName } = props;
  const filteredChildren = filterChildren(node, packageName);
  const link = getLinkForDeclaration(node);
  const pathname = usePathname();

  if (!link) {
    throw new Error(`No link for ${node.name}`);
  }

  if (node.variant !== "declaration") {
    throw new Error(
      `Expected a declaration node, but got ${JSON.stringify(node)}`,
    );
  }

  const isActive = pathname === link;

  return (
    <>
      <SideNavItem className={`${isActive ? styles.active : ""}`}>
        <DocLink href={link}>{node.name}</DocLink>
      </SideNavItem>
      {filteredChildren.length > 0 ? (
        <SideNavGroup>
          {filteredChildren.map((child) => (
            <NavItem key={child.id} node={child} packageName={packageName} />
          ))}
        </SideNavGroup>
      ) : null}
    </>
  );
}

function filterChildren(
  node: J.DeclarationReflection,
  packageName: string,
): J.DeclarationReflection[] {
  let children = node.children || [];

  // global filters
  children = children.filter(
    (child) =>
      !child.flags.isPrivate &&
      !child.flags.isProtected &&
      !child.name.startsWith("_") &&
      child.name !== "constructor",
  );

  // package-specific filters
  switch (packageName.toLowerCase()) {
    case "core":
      children = children.filter(
        (child) => child.kind === ReflectionKind.Class,
      );
      break;
    case "shaders":
      break;
    default:
      throw new Error(`Unknown package: ${packageName}`);
  }

  return children;
}
