import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertSemesterSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // 1. MIDDLEWARE DE SIMULATION D'AUTH
  // Indispensable pour que 'req.user' existe dans toutes les routes suivantes
  app.use((req, res, next) => {
    (req as any).user = {
      id: "uottawa_student_demo",
      username: "etudiant_demo",
      claims: {
        sub: "uottawa_student_demo"
      }
    };
    next();
  });

  // 2. ROUTES D'AUTHENTIFICATION SIMULÉES
  // Route que React appelle pour savoir si on est connecté
  app.get("/api/user", (req, res) => {
    res.json((req as any).user);
  });

  // Route appelée par le formulaire de connexion
  app.post("/api/login", (req, res) => {
    res.json((req as any).user);
  });

  // Route de déconnexion
  app.post("/api/logout", (req, res) => {
    res.json({ message: "Déconnecté" });
  });

  // --- PROTECTED ROUTES (SEMESTERS, COURSES, ASSIGNMENTS) ---
  
  // Semesters
  app.get("/api/semesters", async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const semesters = await storage.getSemesters(userId);
    res.json(semesters);
  });

  app.post("/api/semesters", async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = insertSemesterSchema.parse(req.body);
      const semester = await storage.createSemester({ ...input, userId });
      res.status(201).json(semester);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete("/api/semesters/:id", async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getSemester(id);
    if (!existing) return res.status(404).json({ message: "Semester not found" });
    const userId = (req.user as any).claims.sub;
    if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });
    await storage.deleteSemester(id);
    res.status(204).send();
  });

  // Courses
  app.get(api.courses.list.path, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const courses = await storage.getCourses(userId);
    res.json(courses);
  });

  app.get(api.courses.get.path, async (req, res) => {
    const course = await storage.getCourse(Number(req.params.id));
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    const userId = (req.user as any).claims.sub;
    if (course.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    res.json(course);
  });

  app.post(api.courses.create.path, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.courses.create.input.parse(req.body);
      const course = await storage.createCourse({ ...input, userId } as any);
      res.status(201).json(course);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.courses.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const existing = await storage.getCourse(id);
      if (!existing) return res.status(404).json({ message: "Course not found" });
      
      const userId = (req.user as any).claims.sub;
      if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const input = api.courses.update.input.parse(req.body);
      const updated = await storage.updateCourse(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.courses.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getCourse(id);
    if (!existing) return res.status(404).json({ message: "Course not found" });
    
    const userId = (req.user as any).claims.sub;
    if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteCourse(id);
    res.status(204).send();
  });

  // Assignments
  app.get(api.assignments.list.path, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const query = req.query as any;
    const params = {
      courseId: query.courseId ? Number(query.courseId) : undefined,
      completed: query.completed === 'true' ? true : query.completed === 'false' ? false : undefined,
    };
    
    const assignments = await storage.getAssignments(userId, params);
    res.json(assignments);
  });

  app.get(api.assignments.get.path, async (req, res) => {
    const assignment = await storage.getAssignment(Number(req.params.id));
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    
    const course = await storage.getCourse(assignment.courseId);
    const userId = (req.user as any).claims.sub;
    if (!course || course.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    res.json(assignment);
  });

  app.post(api.assignments.create.path, async (req, res) => {
    try {
      const bodySchema = api.assignments.create.input.extend({
        dueDate: z.coerce.date(),
      });
      const input = bodySchema.parse(req.body);
      
      const course = await storage.getCourse(input.courseId);
      const userId = (req.user as any).claims.sub;
      if (!course || course.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const assignment = await storage.createAssignment(input);
      res.status(201).json(assignment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.assignments.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const existing = await storage.getAssignment(id);
      if (!existing) return res.status(404).json({ message: "Assignment not found" });

      const course = await storage.getCourse(existing.courseId);
      const userId = (req.user as any).claims.sub;
      if (!course || course.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const bodySchema = api.assignments.update.input.extend({
        dueDate: z.coerce.date().optional(),
      });
      const input = bodySchema.parse(req.body);
      const updated = await storage.updateAssignment(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.assignments.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getAssignment(id);
    if (!existing) return res.status(404).json({ message: "Assignment not found" });

    const course = await storage.getCourse(existing.courseId);
    const userId = (req.user as any).claims.sub;
    if (!course || course.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteAssignment(id);
    res.status(204).send();
  });

  return httpServer;
}