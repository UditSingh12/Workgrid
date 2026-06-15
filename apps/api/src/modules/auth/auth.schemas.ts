import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  title: z.string().min(2),
  organizationName: z.string().min(2),
  industry: z.string().min(2),
  timezone: z.string().min(2),
  currency: z.string().min(3).max(3),
  plan: z.enum(["starter", "growth", "enterprise"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
