import { describe,expect,it } from "vitest";
import { hashToken } from "../src/shared/security/token-hash.js";
describe("hashToken",()=>{
  it("gera SHA-256",()=>{
    const hash=hashToken("token");
    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashToken("token"));
  });
});
