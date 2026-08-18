import { describe, expect, it } from "vitest";
import { isNavItemActive } from "@/lib/navigation";

describe("navigation active state", () => {
  it("marks exact and nested routes active", () => {
    expect(isNavItemActive("/feed", "/feed")).toBe(true);
    expect(isNavItemActive("/auth/forgot-password", "/auth")).toBe(true);
    expect(isNavItemActive("/dashboard", "/feed")).toBe(false);
  });

  it("groups public shop details under Coffee shops", () => {
    expect(isNavItemActive("/", "/")).toBe(true);
    expect(isNavItemActive("/shops/shop-1", "/")).toBe(true);
    expect(isNavItemActive("/feed", "/")).toBe(false);
  });

  it("keeps Admin and Modules mutually exclusive", () => {
    expect(isNavItemActive("/admin", "/admin")).toBe(true);
    expect(isNavItemActive("/admin/modules", "/admin")).toBe(false);
    expect(isNavItemActive("/admin/modules", "/admin/modules")).toBe(true);
  });
});
