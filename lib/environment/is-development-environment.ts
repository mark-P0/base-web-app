export function isDevelopmentEnvironment() {
  const isDevelopment = process.env.NODE_ENV === "development";

  return isDevelopment;
}
