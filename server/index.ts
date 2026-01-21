import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import cookieSession from "cookie-session"; // Assure-toi que c'est installé

const app = express();
const httpServer = createServer(app);

// 1. Configuration des middlewares de base
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CONFIGURATION DES SESSIONS (Pour débloquer le Login React)
app.use(cookieSession({
  name: 'session',
  keys: ['uottawa-key-2026'],
  maxAge: 24 * 60 * 60 * 1000, // 24 heures
  secure: process.env.NODE_ENV === "production",
  sameSite: 'lax'
}));

// Fonction de log
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

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
registerRoutes(httpServer, app).catch(err => {
  console.error("Failed to register routes:", err);
});

// 3. GESTION DES FICHIERS STATIQUES
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  (async () => {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
    const port = 5000;
    httpServer.listen({ port, host: "0.0.0.0" }, () => {
      log(`serving on port ${port}`);
    });
  })();
}

// 4. GESTION GLOBALE DES ERREURS
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  console.error("Server Error:", err);
  if (res.headersSent) return next(err);
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

export default app;