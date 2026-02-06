import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertSemesterSchema, insertCourseSchema } from "@shared/schema";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  
  // 1. MIDDLEWARE D'AUTHENTIFICATION FORCÉE
  // Ce bloc s'assure que chaque requête est identifiée comme venant de toi.
  app.use((req: any, res, next) => {
    const demoUser = {
      id: "uottawa_student_demo",
      username: "Stanny_uOttawa",
      claims: { sub: "uottawa_student_demo" }
    };
    req.user = demoUser;
    if (req.session) {
      req.session.userId = demoUser.id;
    }
    next();
  });

  // 2. ROUTES D'ACCÈS (L'alignement pour ton interface)
  // Répond à l'appel que ton Frontend fait au démarrage
  app.get("/api/auth/user", (req, res) => {
    res.json((req as any).user);
  });

  // Intercepte le clic sur le bouton "Sign in with Replit"
  app.get("/api/login", (req, res) => res.redirect("/"));
  app.get("/api/auth/login", (req, res) => res.redirect("/"));

  // 3. GESTION DES SEMESTRES (Écriture dans Neon)
  app.get("/api/semesters", async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const semesters = await storage.getSemesters(userId);
    res.json(semesters);
  });

  app.post("/api/semesters", async (req, res) => {
    try {
      const userId = "uottawa_student_demo";
      // On valide les données reçues mais on injecte manuellement le userId
      const input = insertSemesterSchema.parse(req.body);
      const semester = await storage.createSemester({ ...input, userId });
      res.status(201).json(semester);
    } catch (err: any) {
      console.error("Erreur ajout semestre:", err.message);
      res.status(500).json({ message: "Erreur base de données Neon" });
    }
  });

  // 4. GESTION DES COURS
  app.get("/api/courses", async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const courses = await storage.getCourses(userId);
    res.json(courses);
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const userId = "uottawa_student_demo";
      // On convertit le semesterId en nombre pour éviter l'erreur de type SQL
      const courseData = {
        ...req.body,
        semesterId: req.body.semesterId ? Number(req.body.semesterId) : null,
        userId
      };
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (err: any) {
      console.error("Erreur ajout cours:", err.message);
      res.status(500).json({ message: "Erreur base de données Neon" });
    }
  });

  return httpServer;
}