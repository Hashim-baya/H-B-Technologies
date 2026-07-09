export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { assertEnvironmentValid } = await import("./lib/env-validation");

  if (process.env.NODE_ENV === "production") {
    assertEnvironmentValid();
  }
}
