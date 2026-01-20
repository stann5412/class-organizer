import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// 1. Configuration des middlewares de base (Indispensable)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Fonction de log pour le monitoring
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Middleware de log pour voir les appels API dans Vercel
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// 2. INITIALISATION DES ROUTES
// On lance l'enregistrement immédiatement. 
// registerRoutes est asynchrone mais on ne bloque pas l'export de 'app'
registerRoutes(httpServer, app).catch(err => {
  console.error("Failed to register routes:", err);
});

// 3. GESTION DES FICHIERS STATIQUES ET ENVIRONNEMENT
if (process.env.NODE_ENV === "production") {
  // Sur Vercel, on sert les fichiers compilés
  serveStatic(app);
} else {
  // Sur ton MacBook, on lance le serveur de dev local
  (async () => {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
    const port = 5000;
    httpServer.listen({ port, host: "0.0.0.0" }, () => {
      log(`serving on port ${port}`);
    });
  })();
}

// 4. GESTION GLOBALE DES ERREURS (Doit être après les routes)
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  console.error("Server Error:", err);
  if (res.headersSent) return next(err);
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

// CRUCIAL : Exportation de l'app pour le bridge Vercel
export default app;