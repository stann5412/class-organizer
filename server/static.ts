import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  // Utilisation de process.cwd() pour pointer vers la racine du projet sur Vercel
  const distPath = path.resolve(process.cwd(), "dist", "public");

  // On sert les fichiers statiques sans vérifier l'existence avec fs.existsSync
  // car cela fait crasher les Serverless Functions si le chemin est mal résolu
  app.use(express.static(distPath));

  // Route de secours (Fall-through) pour React
  app.get("*", (req, res, next) => {
    // Si la requête est pour l'API, on ne renvoie pas l'index.html
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        // Au lieu de throw Error, on renvoie une réponse propre
        res.status(404).send("Site files not found. Build may have failed.");
      }
    });
  });
}