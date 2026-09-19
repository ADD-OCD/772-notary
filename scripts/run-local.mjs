import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const [tool, ...args] = process.argv.slice(2);
if (!["next", "prisma", "eslint", "tsc", "tsx"].includes(tool)) throw new Error("Unsupported local tool.");
for (const dir of [".cache/tmp", ".cache/xdg"]) mkdirSync(resolve(root, dir), { recursive: true });
const child = spawn(process.execPath, [resolve(root, "node_modules/.bin", tool), ...args], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env,
    TMPDIR: resolve(root, ".cache/tmp"),
    XDG_CACHE_HOME: resolve(root, ".cache/xdg"),
    NEXT_TELEMETRY_DISABLED: "1",
    PRISMA_HIDE_UPDATE_MESSAGE: "1",
    CHECKPOINT_DISABLE: "1",
    TSX_DISABLE_CACHE: "1",
  },
});
child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
