import fs from "fs";
import path from "path";
import { OrchestratorConfig } from "./types";

function loadJsonConfig(): Partial<OrchestratorConfig> {
  const configPath = path.join(__dirname, "..", "config", "config.json");
  if (!fs.existsSync(configPath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[config] Failed to parse config/config.json:", err);
    return {};
  }
}

export function loadConfig(): OrchestratorConfig {
  const fileConfig = loadJsonConfig();

  const env = process.env;

  const googlePrivateKey =
    env.GOOGLE_PRIVATE_KEY || (fileConfig.googlePrivateKey ?? "");

  // Handle escaped \n in env private key
  const normalizedKey = googlePrivateKey.replace(/\\n/g, "\n");

  const cfg: OrchestratorConfig = {
    googleProjectId:
      env.GOOGLE_PROJECT_ID || fileConfig.googleProjectId || undefined,
    googleClientEmail:
      env.GOOGLE_CLIENT_EMAIL || fileConfig.googleClientEmail || "",
    googlePrivateKey: normalizedKey,
    ledgerSheetId:
      env.LEDGER_SHEET_ID || fileConfig.ledgerSheetId || "",
    nodesRange:
      env.LEDGER_NODES_RANGE || fileConfig.nodesRange || "nodes!A:I",
    runsRange:
      env.LEDGER_RUNS_RANGE || fileConfig.runsRange || "runs!A:I",
    geminiModelId:
      env.GEMINI_MODEL_ID || fileConfig.geminiModelId || "gemini-1.5-pro",
    geminiApiKey:
      env.GEMINI_API_KEY || fileConfig.geminiApiKey || "",
    defaultRunContext:
      env.DEFAULT_RUN_CONTEXT || fileConfig.defaultRunContext || "cli"
  };

  // Basic sanity checks
  const required: (keyof OrchestratorConfig)[] = [
    "googleClientEmail",
    "googlePrivateKey",
    "ledgerSheetId",
    "nodesRange",
    "runsRange",
    "geminiModelId",
    "geminiApiKey"
  ];

  const missing = required.filter((k) => !cfg[k]);
  if (missing.length > 0) {
    throw new Error(
      `[config] Missing required config keys: ${missing.join(", ")}`
    );
  }

  return cfg;
}
