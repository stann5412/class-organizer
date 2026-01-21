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
  
  // MIDDLEWARE DE SIMULATION D'AUTH
  app.use((req, res, next) => {
    // On injecte l'utilisateur dans req.user pour les routes protégées
    (req as any).user = {
      id: "uottawa_student_demo",
      username: "etudiant_demo",
      claims: { sub: "uottawa_student_demo" }
    };
    next();
  });

  // ROUTES D'AUTHENTIFICATION
  app.get("/api/user", (req, res) => {
    // Si la session existe, React verra qu'on est connecté
    res.json((req as any).user);
  });

  app.get("/api/login", (req: any, res) => {
    // On enregistre l'ID dans la session cookie
    req.session.userId = "uottawa_student_demo";
    res.redirect("/");
  });

  app.post("/api/login", (req: any, res) => {
    req.session.userId = "uottawa_student_demo";
    res.json((req as any).user);
  });

  app.post("/api/logout", (req: any, res) => {
    req.session = null;
    res.json({ message: "Déconnecté" });
  });

  // --- TES ROUTES PROTÉGÉES ---
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

  // (Ajoute ici le reste de tes routes Courses et Assignments comme avant...)

  return httpServer;
}