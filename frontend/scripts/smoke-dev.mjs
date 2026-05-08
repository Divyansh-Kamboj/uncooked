import { spawn } from "node:child_process";

const port = 3005;
const baseUrl = `http://127.0.0.1:${port}`;
const timeoutMs = 90000;

const child = spawn("npm", ["run", "dev", "--", "--port", String(port)], {
  cwd: process.cwd(),
  stdio: "pipe",
  env: { ...process.env, CI: "1" },
});

let output = "";
child.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
child.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
    }
    await sleep(1000);
  }
  throw new Error("Timed out waiting for dev server to become reachable");
}

async function run() {
  try {
    await waitForServer();
    const health = await fetch(baseUrl, { redirect: "manual" });
    if (health.status !== 200) {
      throw new Error(`Expected 200 from ${baseUrl}, received ${health.status}`);
    }
    console.log(`Smoke OK: ${baseUrl} returned ${health.status}`);
  } finally {
    child.kill("SIGTERM");
    await sleep(500);
    if (!child.killed) {
      child.kill("SIGKILL");
    }
  }
}

run().catch((error) => {
  console.error(error.message);
  if (output) {
    console.error("\n--- next dev output ---\n" + output);
  }
  process.exit(1);
});
