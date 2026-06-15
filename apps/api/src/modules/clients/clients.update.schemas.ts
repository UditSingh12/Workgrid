import { z } from "zod";

export const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(["active", "lead"]).optional(),
  accountManager: z.string().min(2).optional(),
});
