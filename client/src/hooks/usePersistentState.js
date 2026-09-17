import { useCallback, useEffect, useState } from 'react';

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    // Corrupt JSON or storage blocked in private browsing — start clean rather
    // than crashing the app on boot.
    return fallback;
  }
}

/**
 * useState backed by localStorage.
 *
 * Used for the device-local wishlist so a refresh does not lose it. It is
 * deliberately never used for authentication: session tokens live in an
 * httpOnly cookie that JavaScript cannot read.
 */
export function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Over quota or storage disabled; in-memory state still works for this session.
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(fallback), [fallback]);

  return [value, setValue, reset];
}

export default usePersistentState;
