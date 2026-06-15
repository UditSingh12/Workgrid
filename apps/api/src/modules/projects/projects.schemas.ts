import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2),
  clientId: z.string().min(2),
  status: z.enum(["planned", "active", "review", "completed"]),
  health: z.enum(["good", "risk"]),
});
