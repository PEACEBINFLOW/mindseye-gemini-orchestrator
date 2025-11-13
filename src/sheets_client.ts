import { google, sheets_v4 } from "googleapis";
import { Node, OrchestratorConfig, Run } from "./types";

export class SheetsClient {
  private sheets: sheets_v4.Sheets;
  private sheetId: string;
  private nodesRange: string;
  private runsRange: string;

  constructor(config: OrchestratorConfig) {
    const auth = new google.auth.JWT(
      config.googleClientEmail,
      undefined,
      config.googlePrivateKey,
      ["https://www.googleapis.com/auth/spreadsheets"],
      undefined
    );

    this.sheets = google.sheets({ version: "v4", auth });
    this.sheetId = config.ledgerSheetId;
    this.nodesRange = config.nodesRange;
    this.runsRange = config.runsRange;
  }

  async getNodeById(nodeId: string): Promise<Node | null> {
    const rows = await this.getAllNodes();
    return rows.find((row) => row.node_id === nodeId) ?? null;
  }

  async getActiveNodes(limit?: number): Promise<Node[]> {
    const rows = await this.getAllNodes();
    const active = rows.filter((row) => row.status === "active");
    return typeof limit === "number" ? active.slice(0, limit) : active;
  }

  async appendRun(run: Run): Promise<void> {
    const values = [
      [
        run.run_id,
        run.node_id,
        run.model,
        run.run_context,
        run.input_ref ?? "",
        run.output_ref ?? "",
        run.score ?? "",
        run.notes ?? "",
        run.run_time
      ]
    ];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.sheetId,
      range: this.runsRange,
      valueInputOption: "RAW",
      requestBody: { values }
    });
  }

  private async getAllNodes(): Promise<Node[]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: this.nodesRange
    });

    const rows = res.data.values || [];
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const headerIndex = (name: string) => headers.indexOf(name);

    const idxNodeId = headerIndex("node_id");
    const idxParentNodeId = headerIndex("parent_node_id");
    const idxTitle = headerIndex("title");
    const idxPromptType = headerIndex("prompt_type");
    const idxDocUrl = headerIndex("doc_url");
    const idxStatus = headerIndex("status");
    const idxTags = headerIndex("tags");
    const idxCreatedAt = headerIndex("created_at");
    const idxUpdatedAt = headerIndex("updated_at");

    const nodes: Node[] = dataRows
      .map((row) => {
        const get = (i: number) => (i >= 0 ? row[i] ?? "" : "");
        const node: Node = {
          node_id: get(idxNodeId),
          parent_node_id: get(idxParentNodeId) || null,
          title: get(idxTitle),
          prompt_type: get(idxPromptType),
          doc_url: get(idxDocUrl) || null,
          status: get(idxStatus),
          tags: get(idxTags) || null,
          created_at: get(idxCreatedAt),
          updated_at: get(idxUpdatedAt)
        };
        return node;
      })
      .filter((n) => n.node_id);

    return nodes;
  }
}
