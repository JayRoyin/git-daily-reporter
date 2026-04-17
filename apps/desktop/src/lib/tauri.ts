import { invoke } from "@tauri-apps/api/core";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: {
      invoke?: (cmd: string, args?: Record<string, unknown>, options?: unknown) => Promise<unknown>;
    };
  }
}

export const TAURI_UNAVAILABLE_MESSAGE =
  "Tauri backend is unavailable. Open this page from the desktop app window instead of the browser preview.";

export function isTauriRuntime() {
  return typeof window !== "undefined" && typeof window.__TAURI_INTERNALS__?.invoke === "function";
}

export async function invokeOrThrow<T>(cmd: string, args?: Record<string, unknown>) {
  if (!isTauriRuntime()) {
    throw new Error(TAURI_UNAVAILABLE_MESSAGE);
  }

  return invoke<T>(cmd, args);
}

export async function invokeOrDefault<T>(
  cmd: string,
  fallback: T,
  args?: Record<string, unknown>,
) {
  if (!isTauriRuntime()) {
    return fallback;
  }

  return invoke<T>(cmd, args);
}
