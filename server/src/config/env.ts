import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGO_URI: z.string(),
  JWT_SECRET: z.string(),
  GEMINI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
