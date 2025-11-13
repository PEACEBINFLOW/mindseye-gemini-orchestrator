# MindsEye Gemini Orchestrator

Orchestrator that runs **MindsEye** prompts from a **Google Sheets ledger** through **Gemini / Google AI** and logs results back into the same ledger.

This repo is designed to plug into:

- `mindseye-google-ledger` (Sheet: `nodes` + `runs`)
- Future repos: Workspace automation, Devlog, Analytics, Workflows

The orchestrator:

1. Reads **nodes** from the `nodes` sheet (Prompt Evolution Tree).
2. Selects one or more nodes to run (by `node_id`, `status`, `prompt_type`, etc.).
3. Sends a constructed prompt to **Gemini**.
4. Writes a **run record** into the `runs` sheet.

---

## 🔧 Requirements

- Node.js 18+
- A Google Sheets ledger already set up:
  - `nodes` tab with the columns defined in `mindseye-google-ledger/schema/ledger_columns.md`
  - `runs` tab with columns for run logging
- A Google service account with access to the ledger Sheet
- A Gemini / Google AI API key

---

## ⚙️ Configuration

You can configure the orchestrator via:

- Environment variables (recommended), or
- `config/config.json` (based on `config/config.example.json`)

### Required values

- `LEDGER_SHEET_ID` — same as in `mindseye-google-ledger`
- `LEDGER_NODES_RANGE` — e.g. `nodes!A:I`
- `LEDGER_RUNS_RANGE` — e.g. `runs!A:I`
- `GEMINI_MODEL_ID` — e.g. `gemini-1.5-pro`

For Google Sheets API (service account):

- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (remember to replace `\n` with real newlines in env)
- `GOOGLE_PROJECT_ID` (optional but recommended for clarity)

For Gemini (via `@google/generative-ai`):

- `GEMINI_API_KEY`

---

## 📁 Files

- `src/types.ts` — Shared `Node` and `Run` interfaces
- `src/config.ts` — Loads configuration from env / JSON
- `src/sheets_client.ts` — Google Sheets read/write client
- `src/gemini_client.ts` — Gemini client wrapper
- `src/runner.ts` — Core orchestration logic
- `src/index.ts` — CLI entrypoint
- `scripts/run_node.ts` — Convenience script to run a single node from CLI

---

## 🧪 Example Usage

Install dependencies:

```bash
npm install


