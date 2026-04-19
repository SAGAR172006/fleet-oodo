const buckets = new Map();
let cleanupInterval;

function createRateLimiter({ windowMs = 60_000, max = 120 } = {}) {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) buckets.delete(ip);
      }
    }, 60_000).unref();
  }

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const existing = buckets.get(ip);

    if (!existing || existing.resetAt <= now) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (existing.count >= max) {
      return res.status(429).json({ error: "Too many requests, please try again later." });
    }

    existing.count += 1;
    return next();
  };
}

module.exports = { createRateLimiter };
