import { spawn } from "node:child_process";

const port = 3006;
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
      // keep waiting
    }
    await sleep(1000);
  }
  throw new Error("Timed out waiting for dev server");
}

async function run() {
  try {
    await waitForServer();

    const landing = await fetch(`${baseUrl}/`, { redirect: "manual" });
    const landingHtml = await landing.text();

    if (!landingHtml.includes("Uncooked")) {
      throw new Error("Expected landing page to include product name");
    }
    if (!landingHtml.includes("Start practice")) {
      throw new Error("Expected landing page CTA text: Start practice");
    }

    const start = await fetch(`${baseUrl}/start`, { redirect: "manual" });
    const location = start.headers.get("location") || "";

    if (!location.endsWith("/login")) {
      throw new Error(`Expected /start to redirect unauthenticated users to /login, got: ${location || "<none>"}`);
    }

    console.log("Landing flow checks passed");
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
