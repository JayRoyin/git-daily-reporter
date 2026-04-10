import { describe, expect, it } from "vitest";
import { sanitizeTauriEnvironment } from "../../scripts/tauri-env.js";

describe("sanitizeTauriEnvironment", () => {
  it("removes Snap GTK variables on Linux when launched from Snap", () => {
    const sanitized = sanitizeTauriEnvironment(
      {
        SNAP: "/snap/code/232",
        GTK_PATH: "/snap/code/232/usr/lib/x86_64-linux-gnu/gtk-3.0",
        GTK_EXE_PREFIX: "/snap/code/232/usr",
        GTK_IM_MODULE_FILE: "/home/qstdc/snap/code/common/.cache/immodules/immodules.cache",
        GIO_MODULE_DIR: "/home/qstdc/snap/code/common/.cache/gio-modules",
        PATH: "/usr/bin"
      },
      "linux"
    );

    expect(sanitized.PATH).toBe("/usr/bin");
    expect(sanitized.SNAP).toBe("/snap/code/232");
    expect(sanitized.GTK_PATH).toBeUndefined();
    expect(sanitized.GTK_EXE_PREFIX).toBeUndefined();
    expect(sanitized.GTK_IM_MODULE_FILE).toBeUndefined();
    expect(sanitized.GIO_MODULE_DIR).toBeUndefined();
  });

  it("keeps the environment untouched when not running under Snap", () => {
    const sourceEnv = {
      GTK_PATH: "/usr/lib/x86_64-linux-gnu/gtk-3.0",
      PATH: "/usr/bin"
    };

    const sanitized = sanitizeTauriEnvironment(sourceEnv, "linux");

    expect(sanitized).toEqual(sourceEnv);
    expect(sanitized).not.toBe(sourceEnv);
  });

  it("keeps the environment untouched on non-Linux platforms", () => {
    const sourceEnv = {
      SNAP: "/snap/code/232",
      GTK_PATH: "/snap/code/232/usr/lib/x86_64-linux-gnu/gtk-3.0",
      PATH: "/usr/bin"
    };

    const sanitized = sanitizeTauriEnvironment(sourceEnv, "darwin");

    expect(sanitized).toEqual(sourceEnv);
    expect(sanitized).not.toBe(sourceEnv);
  });
});
