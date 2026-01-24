import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage"; // Sera maintenant coloré
import { insertSemesterSchema } from "@shared/schema";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  
  // Simulation d'utilisateur pour chaque requête
  app.use((req: any, res, next) => {
    req.user = {
      id: "uottawa_student_demo",
      username: "etudiant_demo",
      claims: { sub: "uottawa_student_demo" }
    };
    if (req.session) req.session.userId = "uottawa_student_demo";
    next();
  });

  // Routes d'authentification (Fix pour ton erreur 404 /api/auth/user)
  app.get("/api/auth/user", (req, res) => res.json((req as any).user));
  app.get("/api/auth/login", (req, res) => res.redirect("/"));
  app.get("/api/login", (req, res) => res.redirect("/"));

  // Routes Semestres
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
      res.status(400).json({ message: "Erreur lors de l'ajout" });
    }
  });

  // Routes Cours
  app.get(api.courses.list.path, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const courses = await storage.getCourses(userId);
    res.json(courses);
  });

  app.post(api.courses.create.path, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.courses.create.input.parse(req.body);
      const course = await storage.createCourse({ ...input, userId });
      res.status(201).json(course);
    } catch (err) {
      res.status(400).json({ message: "Erreur ajout cours" });
    }
  });

  return httpServer;
}