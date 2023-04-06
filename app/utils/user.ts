import type { User } from "~/models/user.server";
import { useRootLoaderData } from "~/root";

export function useOptionalUser(): User | null {
  const data = useRootLoaderData();
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}
