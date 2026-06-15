import { z } from "zod";

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  clientId: z.string().min(2).optional(),
  status: z.enum(["planned", "active", "review", "completed"]).optional(),
  health: z.enum(["good", "risk"]).optional(),
});
