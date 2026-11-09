import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { startStudioServer } from "../serve.mjs";

async function chromeExecutable() {
  const candidates = process.env.CHROME_BIN
    ? [process.env.CHROME_BIN]
    : [
        process.env.ProgramFiles && join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
        process.env["ProgramFiles(x86)"] && join(process.env["ProgramFiles(x86)"], "Google", "Chrome", "Application", "chrome.exe"),
        process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
        "/usr/bin/google-chrome",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      ];
  for (const candidate of candidates.filter(Boolean)) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next conventional installation path.
    }
  }
  throw new Error("Google Chrome introuvable. Renseignez CHROME_BIN avec le chemin de son exécutable.");
}

export async function browserFixture(t) {
  const executablePath = await chromeExecutable();
  const directory = await mkdtemp(join(tmpdir(), "entre-rives-test-"));
  const contexts = [];
  let server;
  t.after(async () => {
    await Promise.allSettled(contexts.map(context => context.close()));
    if (server) await new Promise(resolve => server.close(resolve));
    await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
  });
  server = await startStudioServer(0);
  const url = `http://127.0.0.1:${server.address().port}/`;
  return {
    url,
    directory,
    async open(profile, options = {}) {
      const context = await chromium.launchPersistentContext(join(directory, profile), {
        executablePath,
        headless: true,
        acceptDownloads: true,
        ...options,
      });
      contexts.push(context);
      context.setDefaultTimeout(7500);
      const page = context.pages()[0] ?? await context.newPage();
      return { context, page };
    },
  };
}
