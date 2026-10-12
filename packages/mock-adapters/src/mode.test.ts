import { expect, it } from "vitest";
import { isDemoMode } from "./mode.js";

it("stays off under vitest", () => {
  expect(isDemoMode()).toBe(false);
});
