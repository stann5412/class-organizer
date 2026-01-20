import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  // 1. On sert les fichiers statiques (images, js, css)
  app.use(express.static(distPath));

  // 2. SOLUTION ULTIME : Middleware de secours au lieu d'une route nommée
  // Au lieu de app.get("*") ou app.get("/:path*"), on utilise app.use
  // qui intercepte TOUT ce qui arrive jusqu'ici.
  app.use((req, res, next) => {
    // Si c'est un appel API qui a échoué, on ne renvoie pas l'index.html
    // On laisse Express renvoyer un 404 API standard
    if (req.path.startsWith("/api")) {
      return next();
    }

    // Pour tout le reste (navigation React), on envoie l'index.html
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        // On évite le crash, on renvoie un status code
        res.status(404).send("Fichiers statiques introuvables sur Vercel.");
      }
    });
  });
}