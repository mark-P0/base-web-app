import "server-only";

/**
 * Transfers application-owned data before Better Auth removes a linked guest.
 * Derived applications must replace this no-op when guests can own data.
 */
export function transferAnonymousUserData(args: {
  anonymousUserId: string;
  newUserId: string;
}) {
  const { anonymousUserId, newUserId } = args;

  void anonymousUserId;
  void newUserId;
}
