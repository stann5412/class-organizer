import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

// Configuration des middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Fonction de log simplifiée
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Middleware de log
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

// INITIALISATION SYNCHRONE DES ROUTES POUR VERCEL
// On retire le wrapper async immédiat pour éviter les problèmes de timing
registerRoutes(httpServer, app).then(() => {
  // Gestion globale des erreurs
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    console.error("Server Error:", err);
    if (res.headersSent) return next(err);
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }
});

// BLOC DE DÉVELOPPEMENT LOCAL
if (process.env.NODE_ENV !== "production") {
  (async () => {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
    const port = 5000;
    httpServer.listen({ port, host: "0.0.0.0" }, () => {
      log(`serving on port ${port}`);
    });
  })();
}

// CRUCIAL : Exportation de l'app pour Vercel
export default app;