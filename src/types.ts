export interface Node {
  node_id: string;
  parent_node_id: string | null;
  title: string;
  prompt_type: string;
  doc_url: string | null;
  status: string;
  tags: string | null;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export interface Run {
  run_id: string;
  node_id: string;
  model: string;
  run_context: string;
  input_ref: string | null;
  output_ref: string | null;
  score: number | null;
  notes: string | null;
  run_time: string; // ISO datetime
}

export interface OrchestratorConfig {
  googleProjectId?: string;
  googleClientEmail: string;
  googlePrivateKey: string;
  ledgerSheetId: string;
  nodesRange: string;
  runsRange: string;
  geminiModelId: string;
  geminiApiKey: string;
  defaultRunContext: string;
}
