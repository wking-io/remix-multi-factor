import { removeTrailingSlash } from "./misc";

test("Removes trailing slash", () => {
  expect(removeTrailingSlash("/")).toBe("");
  expect(removeTrailingSlash("well/")).toBe("well");
  expect(removeTrailingSlash("also/well/")).toBe("also/well");
  expect(removeTrailingSlash("surprise")).toBe("surprise");
  expect(removeTrailingSlash("/surprise")).toBe("/surprise");
});
