import { SheetsClient } from "./sheets_client";
import { GeminiClient } from "./gemini_client";
import { Node, OrchestratorConfig, Run } from "./types";

function isoNow(): string {
  return new Date().toISOString();
}

function generateRunId(last: number): string {
  const n = last + 1;
  return "RUN-" + String(n).padStart(5, "0");
}

/**
 * Very simple in-memory run counter for this process.
 * In a real system you'd look at the sheet to find the last ID.
 */
let runCounter = 0;

export class Orchestrator {
  private sheets: SheetsClient;
  private gemini: GeminiClient;
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.sheets = new SheetsClient(config);
    this.gemini = new GeminiClient({
      modelId: config.geminiModelId,
      apiKey: config.geminiApiKey
    });
  }

  /**
   * Run a single node by ID.
   */
  async runNode(nodeId: string, context?: string): Promise<Run | null> {
    const node = await this.sheets.getNodeById(nodeId);
    if (!node) {
      console.error(`[orchestrator] Node not found: ${nodeId}`);
      return null;
    }

    const prompt = this.buildPromptFromNode(node);
    const resultText = await this.gemini.runPrompt(prompt);

    const run: Run = {
      run_id: generateRunId(runCounter++),
      node_id: node.node_id,
      model: this.config.geminiModelId,
      run_context: context || this.config.defaultRunContext,
      input_ref: `NODE:${node.node_id}`,
      output_ref: resultText.slice(0, 120) + (resultText.length > 120 ? "..." : ""),
      score: null,
      notes: null,
      run_time: isoNow()
    };

    await this.sheets.appendRun(run);

    console.log(`[orchestrator] Run completed for node ${node.node_id}`);
    return run;
  }

  /**
   * Run all active nodes (very basic batch mode).
   */
  async runAllActive(limit?: number): Promise<Run[]> {
    const nodes = await this.sheets.getActiveNodes(limit);
    const runs: Run[] = [];

    for (const node of nodes) {
      const run = await this.runNode(node.node_id);
      if (run) runs.push(run);
    }

    return runs;
  }

  /**
   * Build a simple textual prompt from the node metadata.
   * You can extend this to fetch full prompt text from the node's doc_url.
   */
  private buildPromptFromNode(node: Node): string {
    const tags = node.tags ? node.tags.split(",").map((t) => t.trim()) : [];
    const tagStr = tags.length ? tags.join(", ") : "none";

    // This is deliberately simple; you’ll likely extend it.
    return [
      `You are MindsEye, a temporal reasoning agent.`,
      ``,
      `Prompt node metadata:`,
      `- Node ID: ${node.node_id}`,
      `- Title: ${node.title}`,
      `- Prompt type: ${node.prompt_type}`,
      `- Tags: ${tagStr}`,
      node.doc_url ? `- Doc URL: ${node.doc_url}` : ``,
      ``,
      `Using the title and prompt_type, generate an appropriate response.`,
      `If this is a workspace_automation prompt, describe the automation behaviour.`,
      `If this is a devlog prompt, outline a Dev.to post structure.`,
      `If this is an analysis prompt, analyze the context implied by the title.`,
      ``,
      `Return only the response content, no extra commentary about being an AI.`
    ]
      .filter(Boolean)
      .join("\n");
  }
}
