import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  // On sert les fichiers statiques (JS, CSS, Images)
  app.use(express.static(distPath));

  // CORRECTION EXPRESS 5 : Syntaxe de paramètre nommé
  // ":path*" capture tout le reste de l'URL dans une variable nommée "path"
  app.get("/:path*", (req, res, next) => {
    // Si la requête est destinée à l'API, on ne sert pas le HTML
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    // On envoie l'index.html pour toutes les autres routes (React routing)
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        // En cas d'erreur de fichier, on renvoie un 404 propre au lieu de crash
        res.status(404).send("Fichiers du site introuvables. Vérifiez le build.");
      }
    });
  });
}