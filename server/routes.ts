import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(httpServer: Server, app: Express) {
  
  // 1. MIDDLEWARE D'INJECTION (Pour que toutes les routes fonctionnent)
  app.use((req: any, res, next) => {
    const demoUser = {
      id: "uottawa_student_demo",
      username: "etudiant_demo",
      claims: { sub: "uottawa_student_demo" }
    };
    req.user = demoUser;
    if (req.session) {
      req.session.userId = demoUser.id;
    }
    next();
  });

  // 2. LA CORRECTION CRUCIALE : Aligner l'URL sur ce que React demande
  // On ajoute "/auth" dans le chemin pour correspondre à ton erreur 404
  app.get("/api/auth/user", (req, res) => {
    res.json((req as any).user);
  });

  // On garde aussi l'ancienne pour la compatibilité au cas où
  app.get("/api/user", (req, res) => {
    res.json((req as any).user);
  });
  
  // Correction pour le bouton de login (si React appelle aussi /api/auth/login)
  app.get("/api/auth/login", (req: any, res) => {
    req.session.userId = "uottawa_student_demo";
    res.redirect("/");
  });

  app.get("/api/login", (req: any, res) => {
    req.session.userId = "uottawa_student_demo";
    res.redirect("/");
  });

  // --- ICI TES ROUTES DE SEMESTRES ET COURS ---
  // ... (Garde ton code existant pour les semestres ici)
  
  return httpServer;
}