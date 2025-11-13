import { loadConfig } from "../src/config";
import { Orchestrator } from "../src/runner";

/**
 * Convenience script:
 *  npm run run-node -- PET-00001
 */
async function run() {
  const args = process.argv.slice(2);
  const nodeId = args[0];

  if (!nodeId) {
    console.error("Usage: npm run run-node -- <NODE_ID>");
    process.exit(1);
  }

  const config = loadConfig();
  const orchestrator = new Orchestrator(config);

  console.log(`[run-node] Running node: ${nodeId}`);
  await orchestrator.runNode(nodeId);
}

run().catch((err) => {
  console.error("[run-node] Fatal error:", err);
  process.exit(1);
});
