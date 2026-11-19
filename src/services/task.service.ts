import { Prisma } from "../generated/prisma/client";
import { prisma } from "../prisma";
import { AppError } from "../middlewares/error.middleware";

export class TaskService {
  async create(data: {
    title: string;
    description?: string;
    status?: string;
    assignee: string;
    dueDate: string;
  }) {
    return prisma.task.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
      },
    });
  }

  async findAll(filters: {
    status?: string;
    assignee?: string;
    page: number;
    limit: number;
  }) {
    const { status, assignee, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};
    if (status) where.status = status;
    if (assignee) where.assignee = { contains: assignee };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new AppError(404, `Tarea con ID ${id} no encontrada`);
    return task;
  }

  async update(
    id: number,
    data: Partial<{
      title: string;
      description?: string;
      status: string;
      assignee: string;
      dueDate: string;
    }>,
  ) {
    await this.findById(id);

    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      },
    });
  }

  async delete(id: number) {
    await this.findById(id);
    await prisma.task.delete({ where: { id } });
  }
}
