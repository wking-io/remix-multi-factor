import { invariant } from "~/utils/invariant";

export function getEnv() {
  return {
    NODE_ENV: getEnvOrWarn("NODE_ENV", "development"),
  };
}

export function getEnvOrWarn(env: string, defaultValue: string) {
  const envVar = process.env?.[env];
  return envVar ?? defaultValue;
}

export function getEnvOrThrow(env: string) {
  const envVar = process.env?.[env];
  invariant(envVar, `We could not find an environment variable for ${env}`);
  return envVar;
}
