import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service";

import { AppError } from "../middlewares/error.middleware";
import {
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema,
} from "../schemas/task.schema";

const taskService = new TaskService();

export class TaskController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createTaskSchema.parse(req.body);
      const task = await taskService.create(validatedData);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = taskQuerySchema.parse(req.query);
      const result = await taskService.findAll(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError(400, "El ID debe ser numérico");
      const task = await taskService.findById(id);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError(400, "El ID debe ser numérico");
      const validatedData = updateTaskSchema.parse(req.body);
      const updated = await taskService.update(id, validatedData);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError(400, "El ID debe ser numérico");
      await taskService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
