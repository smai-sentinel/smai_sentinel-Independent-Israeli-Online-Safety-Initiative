// Identity here must come from the verified server session, never request data.
export function aiAccess(user, env = {}) {
  const owner = user?.isOwner === true;
  return {
    tier: owner ? 'creator' : user ? 'member' : 'guest',
    textPerHour: owner ? null : user ? 120 : 12,
    imagesPerHour: owner ? null : user ? 20 : 3,
    providerLimited: true,
    available: Boolean(env.AI || env.GEMINI_API_KEY),
    searchAvailable: Boolean(env.GEMINI_API_KEY),
    imagesAvailable: Boolean(env.AI),
    browserAvailable: Boolean(env.BROWSER),
  };
}
