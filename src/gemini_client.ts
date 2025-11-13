import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiOptions {
  modelId: string;
  apiKey: string;
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private modelId: string;

  constructor(opts: GeminiOptions) {
    this.genAI = new GoogleGenerativeAI(opts.apiKey);
    this.modelId = opts.modelId;
  }

  /**
   * Simple wrapper: send a prompt string, get back a text response.
   */
  async runPrompt(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.modelId });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  }
}
