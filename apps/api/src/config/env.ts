import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: z.string().default("Workgrid API"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("14d"),
  JWT_SECRET: z.string().min(16).default("change-this-jwt-secret"),
  REFRESH_TOKEN_SECRET: z.string().min(16).default("change-this-refresh-token-secret"),
  MONGODB_URI: z.string().optional(),
  SERVE_STATIC_FRONTEND: z.coerce.boolean().default(false),
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  API_RATE_LIMIT_MAX: z.coerce.number().default(300),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(25),
});

export const env = envSchema.parse(process.env);
