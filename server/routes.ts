import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Protected Routes - require authentication
  
  // Courses
  app.get(api.courses.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const courses = await storage.getCourses(userId);
    res.json(courses);
  });

  app.get(api.courses.get.path, isAuthenticated, async (req, res) => {
    const course = await storage.getCourse(Number(req.params.id));
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    // Check ownership
    const userId = (req.user as any).claims.sub;
    if (course.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    res.json(course);
  });

  app.post(api.courses.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      // Inject userId into the body for validation if schema requires it, 
      // or just pass it to storage if schema omitted it (which it did).
      // Our insertCourseSchema omitted userId, so we need to add it manually when calling storage.
      // But wait, storage.createCourse takes InsertCourse which omitted userId.
      // Let's check schema.ts... 
      // insertCourseSchema omits userId. But database table requires it.
      // So InsertCourse type does NOT have userId. 
      // We need to fix storage.ts or schema.ts to handle this.
      // Ideally storage should take { ...course, userId }.
      
      const input = api.courses.create.input.parse(req.body);
      // We need to cast or extend the type passed to storage
      const course = await storage.createCourse({ ...input, userId });
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

  app.put(api.courses.update.path, isAuthenticated, async (req, res) => {
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

  app.delete(api.courses.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getCourse(id);
    if (!existing) return res.status(404).json({ message: "Course not found" });
    
    const userId = (req.user as any).claims.sub;
    if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteCourse(id);
    res.status(204).send();
  });

  // Assignments
  app.get(api.assignments.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    // Parse query params
    const query = req.query as any;
    const params = {
      courseId: query.courseId ? Number(query.courseId) : undefined,
      completed: query.completed === 'true' ? true : query.completed === 'false' ? false : undefined,
    };
    
    const assignments = await storage.getAssignments(userId, params);
    res.json(assignments);
  });

  app.get(api.assignments.get.path, isAuthenticated, async (req, res) => {
    const assignment = await storage.getAssignment(Number(req.params.id));
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    
    // Check ownership via course
    const course = await storage.getCourse(assignment.courseId);
    const userId = (req.user as any).claims.sub;
    if (!course || course.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    res.json(assignment);
  });

  app.post(api.assignments.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.assignments.create.input.parse(req.body);
      
      // Verify course ownership
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

  app.put(api.assignments.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const existing = await storage.getAssignment(id);
      if (!existing) return res.status(404).json({ message: "Assignment not found" });

      // Verify ownership
      const course = await storage.getCourse(existing.courseId);
      const userId = (req.user as any).claims.sub;
      if (!course || course.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const input = api.assignments.update.input.parse(req.body);
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

  app.delete(api.assignments.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getAssignment(id);
    if (!existing) return res.status(404).json({ message: "Assignment not found" });

    // Verify ownership
    const course = await storage.getCourse(existing.courseId);
    const userId = (req.user as any).claims.sub;
    if (!course || course.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteAssignment(id);
    res.status(204).send();
  });

  return httpServer;
}
