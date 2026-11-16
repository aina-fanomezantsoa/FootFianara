import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";

const req = (cookie?: string) =>
  new NextRequest("http://localhost/admin/clubs", {
    headers: cookie ? { cookie } : {},
  });

describe("proxy /admin", () => {
  it("sans session : 307 vers /login", () => {
    const res = proxy(req())!;
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });
  it("avec cookie de session : laisse passer", () => {
    expect(proxy(req("authjs.session-token=x"))).toBeUndefined();
    expect(proxy(req("__Secure-authjs.session-token=x"))).toBeUndefined();
  });
});
