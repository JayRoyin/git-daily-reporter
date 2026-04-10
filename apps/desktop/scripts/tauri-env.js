const SNAP_GTK_ENV_KEYS = [
  "GIO_MODULE_DIR",
  "GTK_EXE_PREFIX",
  "GTK_IM_MODULE_FILE",
  "GTK_PATH"
];

export function sanitizeTauriEnvironment(env, platform = process.platform) {
  if (platform !== "linux") {
    return { ...env };
  }

  const nextEnv = { ...env };
  const launchedFromSnap = Boolean(env.SNAP || env.SNAP_NAME || env.GTK_PATH?.startsWith("/snap/"));

  if (!launchedFromSnap) {
    return nextEnv;
  }

  for (const key of SNAP_GTK_ENV_KEYS) {
    delete nextEnv[key];
  }

  return nextEnv;
}
