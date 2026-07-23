// In-memory token blacklist for logout support.
//
// SCALABILITY NOTE: this works fine for a single instance / demo, but
// an in-memory Set doesn't share state across multiple app instances
// behind a load balancer. In production this should be swapped for
// Redis (SETEX <jti> "1" <ttlSeconds>) so every instance sees the
// same blacklist. The interface below is intentionally tiny so
// swapping the implementation later doesn't touch calling code.
const blacklist = new Map(); // jti -> expiry epoch ms

function add(jti, expiresAtMs) {
  blacklist.set(jti, expiresAtMs);
}

function isBlacklisted(jti) {
  return blacklist.has(jti);
}

// Periodic cleanup so the Map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [jti, expiry] of blacklist.entries()) {
    if (expiry <= now) blacklist.delete(jti);
  }
}, 10 * 60 * 1000).unref();

export default {isBlacklisted, add};
