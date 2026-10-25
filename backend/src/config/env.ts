import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from current directory, fallback to parent directory if needed
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/odin'),
  USE_MEMORY_DB_FALLBACK: z.preprocess((val) => val === 'true' || val === true || val === undefined, z.boolean()).default(true),
  
  // LLM Configuration
  LLM_PROVIDER_ORDER: z.string().default('claude,groq,gemini,openai'),
  LLM_TIMEOUT_SECONDS: z.coerce.number().default(15),
  LLM_TEMPERATURE: z.coerce.number().default(0.2),
  
  ANTHROPIC_API_KEY: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  CLAUDE_MODEL: z.string().default('claude-3-5-sonnet-20241022'),
  
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('qwen/qwen3.8-27b'),
  
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-flash-latest'),
  
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_API_BASE: z.string().default('https://api.openai.com/v1'),
  
  // War Room & Data Paths
  ODIN_DATA_DIR: z.string().default('../odin_data'),
  DEFAULT_CLOCK_DATE: z.string().default('2027-01-15'),
  BUSINESS_CALENDAR_HOLIDAYS: z.string().default('../odin_data/bundle/data/holidays.csv'),
  PAYMENTS_LEDGER_FILE: z.string().default('../odin_data/bundle/data/payments_ledger.csv'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[Config] Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
