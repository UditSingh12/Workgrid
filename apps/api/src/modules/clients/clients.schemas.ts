import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(2),
  status: z.enum(["active", "lead"]),
  accountManager: z.string().min(2),
});
