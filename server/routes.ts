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
  
  // 1. MIDDLEWARE DE SESSION ET D'AUTH FORCÉE
  // Ce bloc s'exécute AVANT tout le reste pour garantir l'accès
  app.use((req: any, res, next) => {
    // Force l'ID dans le cookie
    if (req.session) {
      req.session.userId = "uottawa_student_demo";
    }

    // Simule l'utilisateur pour le Backend (Drizzle/Storage)
    req.user = {
      id: "uottawa_student_demo",
      username: "etudiant_demo",
      claims: { sub: "uottawa_student_demo" }
    };
    next();
  });

  // 2. ROUTES D'AUTHENTIFICATION SIMULÉES
  app.get("/api/user", (req, res) => {
    res.json((req as any).user);
  });

  // Route GET pour le bouton "Sign in with Replit"
  app.get("/api/login", (req: any, res) => {
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

  // --- PROTECTED ROUTES (SEMESTERS, COURSES, ASSIGNMENTS) ---
  
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

  // Note: Copie ici le reste de tes routes (Courses et Assignments) 
  // que tu avais précédemment dans ton fichier routes.ts original.

  return httpServer;
}