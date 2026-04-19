const SAFE_KEY_PATTERN = /^[A-Za-z0-9_-]+$/;
const SAFE_ROLE_PATTERN = /^[A-Za-z ]+$/;

function normalizeSafeKey(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > 100) return null;
  return SAFE_KEY_PATTERN.test(normalized) ? normalized : null;
}

function normalizeRole(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > 50) return null;
  return SAFE_ROLE_PATTERN.test(normalized) ? normalized : null;
}

function sanitizeObject(input) {
  if (Array.isArray(input)) return input.map(sanitizeObject);
  if (!input || typeof input !== "object") return input;

  const out = {};
  Object.entries(input).forEach(([key, value]) => {
    if (key.startsWith("$") || key.includes(".")) return;
    out[key] = sanitizeObject(value);
  });
  return out;
}

module.exports = { normalizeSafeKey, normalizeRole, sanitizeObject };
