export function isNavItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/shops/");
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
