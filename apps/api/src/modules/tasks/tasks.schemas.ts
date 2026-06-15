import { z } from "zod";

export const createTaskSchema = z.object({
  projectId: z.string().min(2),
  title: z.string().min(2),
  status: z.enum(["backlog", "in_progress", "review", "completed"]),
  dueDate: z.string().min(2),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  status: z.enum(["backlog", "in_progress", "review", "completed"]).optional(),
  dueDate: z.string().min(2).optional(),
});
