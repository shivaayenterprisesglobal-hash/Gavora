import { useEffect, useState } from 'react';

/**
 * Runs an async loader and tracks its real lifecycle: loading, success, error.
 *
 * Loading is derived (the stored result's key does not match the current
 * request key) rather than written in an effect, so the first paint of a new
 * query is already in the loading state.
 *
 * @param {() => Promise<T>} loader   Async function producing the data.
 * @param {unknown[]} deps            Re-runs the loader when these change.
 * @template T
 */
export function useAsyncData(loader, deps = []) {
  const depsKey = JSON.stringify(deps);
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = `${depsKey}#${reloadCount}`;
  const [result, setResult] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    let cancelled = false;

    loader()
      .then((data) => {
        if (cancelled) return;
        setResult({ key: requestKey, data, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setResult({ key: requestKey, data: null, error });
      });

    return () => {
      cancelled = true;
    };
    // loader is recreated by callers on every render; depsKey is the contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  return {
    data: result.key === requestKey ? result.data : null,
    isLoading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    reload: () => setReloadCount((count) => count + 1),
  };
}

export default useAsyncData;
