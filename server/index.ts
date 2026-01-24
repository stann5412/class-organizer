import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import cookieSession from "cookie-session";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuration des sessions pour Vercel
app.use(cookieSession({
  name: 'session',
  keys: ['uottawa-key-2026'],
  maxAge: 24 * 60 * 60 * 1000,
  secure: false, // Plus simple pour le déploiement initial
  sameSite: 'lax'
}));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

registerRoutes(httpServer, app).catch(err => console.error(err));

if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  (async () => {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
    httpServer.listen(5000, "0.0.0.0");
  })();
}

export default app;