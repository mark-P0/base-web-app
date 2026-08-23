import { expect, test } from "bun:test";
import { isDevelopmentEnvironment } from "../../../lib/environment/is-development-environment";

test("identifies the development environment", () => {
  const previousEnvironment = process.env.NODE_ENV;

  try {
    Reflect.set(process.env, "NODE_ENV", "development");
    expect(isDevelopmentEnvironment()).toBe(true);

    Reflect.set(process.env, "NODE_ENV", "production");
    expect(isDevelopmentEnvironment()).toBe(false);
  } finally {
    if (previousEnvironment) {
      Reflect.set(process.env, "NODE_ENV", previousEnvironment);
    } else {
      Reflect.deleteProperty(process.env, "NODE_ENV");
    }
  }
});
