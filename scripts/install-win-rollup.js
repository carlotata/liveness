import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.platform === "win32") {
  // Prevent infinite postinstall loop when npm install is invoked inside postinstall
  if (process.env.POSTINSTALL_WIN_ROLLUP_RUNNING) {
    process.exit(0);
  }

  const rollupWinPackagePath = path.resolve(
    __dirname,
    "../node_modules/@rollup/rollup-win32-x64-msvc"
  );

  if (fs.existsSync(rollupWinPackagePath)) {
    console.log("@rollup/rollup-win32-x64-msvc is already installed.");
  } else {
    console.log("Windows OS detected. Installing @rollup/rollup-win32-x64-msvc...");
    try {
      execSync("npm install @rollup/rollup-win32-x64-msvc --save-dev --no-audit --no-fund", {
        stdio: "inherit",
        env: { ...process.env, POSTINSTALL_WIN_ROLLUP_RUNNING: "true" },
      });
      console.log("Successfully installed @rollup/rollup-win32-x64-msvc.");
    } catch (error) {
      console.error("Failed to install @rollup/rollup-win32-x64-msvc:", error.message);
      process.exit(1);
    }
  }
} else {
  console.log(
    `Platform is ${process.platform}. Skipping installation of @rollup/rollup-win32-x64-msvc (Windows only).`
  );
}
