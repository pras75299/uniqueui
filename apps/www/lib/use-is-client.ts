import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getServerSnapshot = () => false;
const getClientSnapshot = () => true;

/**
 * Returns `false` during SSR and the first hydration render, `true` after.
 * Use this to gate UI that depends on client-only signals (timestamps,
 * `localStorage`, `matchMedia`) without triggering hydration mismatches.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
