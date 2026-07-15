import { describe,expect,it } from "vitest";
import { hashPassword,verifyPassword } from "../src/shared/security/password.js";
describe("password",()=>{
  it("faz hash e valida",async()=>{
    const hash=await hashPassword("BaristaOS@123");
    expect(hash).not.toBe("BaristaOS@123");
    await expect(verifyPassword("BaristaOS@123",hash)).resolves.toBe(true);
    await expect(verifyPassword("errada",hash)).resolves.toBe(false);
  });
});
