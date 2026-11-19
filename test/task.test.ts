import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import app from "../src/app";
import { prisma } from "../src/prisma";

beforeEach(async () => {
  await prisma.task.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Tasks API", () => {
  it("1. POST /api/tasks - debe crear una tarea válida y devolver 201", async () => {
    const res = await request(app).post("/api/tasks").send({
      title: "Implementar endpoints REST",
      description: "Crear CRUD de tareas con Express y Prisma",
      status: "en_curso",
      assignee: "Yoel",
      dueDate: "2026-12-01",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Implementar endpoints REST");
    expect(res.body.status).toBe("en_curso");
  });

  it("2. POST /api/tasks - debe devolver 400 si el estado es inválido o faltan campos", async () => {
    const res = await request(app).post("/api/tasks").send({
      title: "A",
      status: "estado_inexistente",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("details");
  });

  it("3. GET /api/tasks - debe filtrar por estado y responsable con paginación", async () => {
    await prisma.task.createMany({
      data: [
        {
          title: "Tarea 1",
          status: "pendiente",
          assignee: "Yoel",
          dueDate: new Date("2026-12-01"),
        },
        {
          title: "Tarea 2",
          status: "hecha",
          assignee: "Yoel",
          dueDate: new Date("2026-12-02"),
        },
        {
          title: "Tarea 3",
          status: "pendiente",
          assignee: "Martha",
          dueDate: new Date("2026-12-03"),
        },
      ],
    });

    const res = await request(app).get(
      "/api/tasks?status=pendiente&assignee=Yoel&page=1&limit=5",
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Tarea 1");
    expect(res.body.meta).toEqual({
      total: 1,
      page: 1,
      limit: 5,
      totalPages: 1,
    });
  });

  it("4. GET /api/tasks/:id - debe devolver 404 si la tarea no existe", async () => {
    const res = await request(app).get("/api/tasks/9999");
    expect(res.status).toBe(404);
  });
});
