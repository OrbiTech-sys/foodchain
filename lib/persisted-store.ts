/**
 * A tiny external store persisted to localStorage, shaped for React's useSyncExternalStore.
 *
 * - The server (and the first client render) always see `initial`, so hydration never mismatches.
 * - After hydration React re-reads the real value from localStorage.
 * - Every read/write is wrapped in try/catch: private windows and blocked storage fall back to memory.
 * - Other tabs stay in sync through the `storage` event.
 */
export interface PersistedStore<T> {
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  set: (next: T | ((previous: T) => T)) => void;
}

interface Options<T> {
  key: string;
  initial: T;
  /** Validates untrusted JSON from storage. Return null to discard it. */
  parse: (raw: unknown) => T | null;
}

export function createPersistedStore<T>({ key, initial, parse }: Options<T>): PersistedStore<T> {
  let state = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function readFromStorage(raw: string | null): T {
    if (!raw) return initial;
    try {
      return parse(JSON.parse(raw)) ?? initial;
    } catch {
      return initial;
    }
  }

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      state = readFromStorage(window.localStorage.getItem(key));
    } catch {
      state = initial;
    }
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function onStorage(event: StorageEvent) {
    if (event.key !== key) return;
    state = readFromStorage(event.newValue);
    emit();
  }

  return {
    getSnapshot() {
      load();
      return state;
    },
    getServerSnapshot() {
      return initial;
    },
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    set(next) {
      load();
      state = typeof next === "function" ? (next as (previous: T) => T)(state) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* storage unavailable — keep the in-memory state */
      }
      emit();
    },
  };
}
