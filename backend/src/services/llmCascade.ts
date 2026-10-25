import { env } from '../config/env';

export type MockHandler = (prompt: string, systemPrompt?: string) => string | null;

export class LLMCascadeService {
  private mockHandler: MockHandler | null = null;
  private lastSuccessfulProvider: string | null = null;
  public totalPromptTokens = 0;
  public totalCompletionTokens = 0;

  public get providerOrder(): string[] {
    const raw = env.LLM_PROVIDER_ORDER;
    if (raw) {
      const custom = raw.split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
      if (custom.length > 0) return custom;
    }
    return ['claude', 'groq', 'gemini', 'openai'];
  }

  public getApiKey(provider: string): string | undefined {
    const p = provider.toLowerCase();
    if (p === 'claude' || p === 'anthropic') {
      return env.CLAUDE_API_KEY || env.ANTHROPIC_API_KEY;
    } else if (p === 'groq') {
      return env.GROQ_API_KEY;
    } else if (p === 'gemini' || p === 'google') {
      return env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
    } else if (p === 'openai') {
      return env.OPENAI_API_KEY;
    }
    return undefined;
  }

  public getModel(provider: string): string {
    const p = provider.toLowerCase();
    if (p === 'claude' || p === 'anthropic') {
      return env.CLAUDE_MODEL;
    } else if (p === 'groq') {
      return env.GROQ_MODEL;
    } else if (p === 'gemini' || p === 'google') {
      return env.GEMINI_MODEL;
    } else if (p === 'openai') {
      return env.OPENAI_MODEL;
    }
    return 'default';
  }

  public get configuredProviders(): string[] {
    return this.providerOrder.filter((p) => Boolean(this.getApiKey(p)));
  }

  public get isAvailable(): boolean {
    return this.configuredProviders.length > 0 || this.mockHandler !== null;
  }

  public get activeProvider(): string {
    if (this.lastSuccessfulProvider) return this.lastSuccessfulProvider;
    for (const p of this.providerOrder) {
      if (this.getApiKey(p)) return p;
    }
    return 'none';
  }

  public get activeModel(): string {
    return this.getModel(this.activeProvider);
  }

  public setMockHandler(handler: MockHandler | null): void {
    this.mockHandler = handler;
  }

  public clearMockHandler(): void {
    this.mockHandler = null;
  }

  public async generate(prompt: string, systemPrompt?: string): Promise<string | null> {
    if (this.mockHandler) {
      const mockResult = this.mockHandler(prompt, systemPrompt);
      if (mockResult !== null) return mockResult;
    }

    const providers = this.providerOrder;
    for (const provider of providers) {
      const key = this.getApiKey(provider);
      if (!key) continue;

      try {
        let result: string | null = null;
        if (provider === 'claude' || provider === 'anthropic') {
          result = await this.callClaude(key, prompt, systemPrompt);
        } else if (provider === 'groq') {
          result = await this.callGroq(key, prompt, systemPrompt);
        } else if (provider === 'gemini' || provider === 'google') {
          result = await this.callGemini(key, prompt, systemPrompt);
        } else if (provider === 'openai') {
          result = await this.callOpenAI(key, prompt, systemPrompt);
        }

        if (result && result.trim()) {
          this.lastSuccessfulProvider = provider;
          return result.trim();
        }
      } catch (err: any) {
        console.warn(`[LLMCascade] Provider ${provider} failed (${err.message}), falling back to next provider...`);
      }
    }

    return null;
  }

  private async callClaude(apiKey: string, prompt: string, systemPrompt?: string): Promise<string> {
    const model = this.getModel('claude');
    const timeoutMs = env.LLM_TIMEOUT_SECONDS * 1000;
    const body: Record<string, any> = {
      model,
      max_tokens: 4096,
      temperature: env.LLM_TEMPERATURE,
      messages: [{ role: 'user', content: prompt }],
    };
    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`Claude error HTTP ${res.status}: ${res.statusText}`);
    }
    const data: any = await res.json();
    return data.content?.[0]?.text || '';
  }

  private async callGroq(apiKey: string, prompt: string, systemPrompt?: string): Promise<string> {
    const model = this.getModel('groq');
    const timeoutMs = env.LLM_TIMEOUT_SECONDS * 1000;
    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: env.LLM_TEMPERATURE,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`Groq error HTTP ${res.status}: ${res.statusText}`);
    }
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async callGemini(apiKey: string, prompt: string, systemPrompt?: string): Promise<string> {
    const model = this.getModel('gemini');
    const timeoutMs = env.LLM_TIMEOUT_SECONDS * 1000;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents: any[] = [];
    const parts: any[] = [];
    if (systemPrompt) {
      parts.push({ text: `System Instruction: ${systemPrompt}\n\n` });
    }
    parts.push({ text: prompt });
    contents.push({ role: 'user', parts });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`Gemini error HTTP ${res.status}: ${res.statusText}`);
    }
    const data: any = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async callOpenAI(apiKey: string, prompt: string, systemPrompt?: string): Promise<string> {
    const model = this.getModel('openai');
    const timeoutMs = env.LLM_TIMEOUT_SECONDS * 1000;
    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(`${env.OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: env.LLM_TEMPERATURE,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`OpenAI error HTTP ${res.status}: ${res.statusText}`);
    }
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

export const llmService = new LLMCascadeService();
