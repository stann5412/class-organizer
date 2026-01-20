import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  // Utilisation de process.cwd() pour pointer vers la racine du projet sur Vercel
  const distPath = path.resolve(process.cwd(), "dist", "public");

  // On sert les fichiers statiques normalement
  app.use(express.static(distPath));

  // CORRECTION POUR EXPRESS 5 : 
  // On utilise "(.*)" au lieu de "*" pour capturer toutes les routes (wildcard)
  // sans provoquer l'erreur "Missing parameter name".
  app.get("(.*)", (req, res, next) => {
    // Si la requête commence par /api, on ne sert pas l'index.html
    // On laisse les routes de routes.ts gérer la requête
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    // Pour toutes les autres routes (navigation React), on envoie l'index.html
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        // Au lieu de faire crasher le serveur avec un throw, 
        // on renvoie une erreur 404 propre.
        res.status(404).send("Site files not found. Build may have failed.");
      }
    });
  });
}