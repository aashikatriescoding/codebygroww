// Simple in-memory TTL cache, shared across all users/requests.
// Good enough for a hackathon's scale; swap for Redis if you ever need
// multi-server deployment.

const store = new Map();

const set = (key, value, ttlMs) => {
  const expiresAt = Date.now() + ttlMs;
  store.set(key, { value, expiresAt });
};

const get = (key) => {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.value;
};

module.exports = { get, set };