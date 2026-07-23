import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3333),
  LOG_LEVEL: z.enum(["fatal","error","warn","info","debug","trace","silent"]).default("info"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174")
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Configuração de ambiente inválida.");
}
export const env = parsed.data;
