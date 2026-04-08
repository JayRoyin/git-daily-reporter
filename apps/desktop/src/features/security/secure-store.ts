const memoryStore = new Map<string, string>();

async function getStrongholdHandles(password: string) {
  const [{ Stronghold }, { appDataDir }] = await Promise.all([
    import("@tauri-apps/plugin-stronghold"),
    import("@tauri-apps/api/path"),
  ]);

  const vaultPath = `${await appDataDir()}git-daily-reporter.hold`;
  const stronghold = await Stronghold.load(vaultPath, password);

  let client;
  try {
    client = await stronghold.loadClient("git-daily-reporter");
  } catch {
    client = await stronghold.createClient("git-daily-reporter");
  }

  return {
    stronghold,
    store: client.getStore(),
  };
}

export async function saveSecret(
  password: string,
  key: string,
  value: string,
): Promise<string> {
  if (import.meta.env.MODE === "test") {
    memoryStore.set(key, value);
    return `memory://${key}`;
  }

  const data = Array.from(new TextEncoder().encode(value));
  const { stronghold, store } = await getStrongholdHandles(password);
  await store.insert(key, data);
  await stronghold.save();
  return `stronghold://${key}`;
}

export async function loadSecret(password: string, key: string): Promise<string> {
  if (import.meta.env.MODE === "test") {
    return memoryStore.get(key) ?? "";
  }

  const { store } = await getStrongholdHandles(password);
  const data = await store.get(key);
  if (!data) {
    return "";
  }
  return new TextDecoder().decode(new Uint8Array(data));
}
