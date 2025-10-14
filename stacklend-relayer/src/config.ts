import "dotenv/config";
import { z } from "zod";

const Env = z.object({
  PORT: z.string().default("3000"),
  STACKS_API_URL: z.string().url(),
  COLLATERAL_CONTRACT_ID: z.string(),
  STACKS_CONFIRMATIONS: z.string().default("1"),
  SUI_RPC_URL: z.string().url().optional(),
  RELAYER_PRIVATE_KEY: z.string(), // For Sui, this should be base64 encoded private key
  BORROW_CONTROLLER_PACKAGE: z.string(), // Sui package address
  LENDING_POOL_OBJECT: z.string(), // Sui object address
  TOKEN_MAP: z.string().default("{}"),
  POLL_INTERVAL_MS: z.string().default("6000"),
  STATE_FILE: z.string().default("./state.json"),
});

export const env = Env.parse(process.env);
export const tokenMap: Record<string, string> = JSON.parse(env.TOKEN_MAP);

