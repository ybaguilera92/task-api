import { z } from "zod";

export const TaskStatusEnum = z.enum(["pendiente", "en_curso", "hecha"]);

export const createTaskSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  status: TaskStatusEnum.optional().default("pendiente"),
  assignee: z.string().min(2, "El responsable es obligatorio"),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha límite inválida (use formato ISO 8601, ej: 2026-12-31)",
  }),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  status: TaskStatusEnum.optional(),
  assignee: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
