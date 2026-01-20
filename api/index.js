import pkg from '../dist/index.cjs';

// Extraction de l'application Express
const app = pkg.default || pkg;

export default async (req, res) => {
  // On attend que l'application Express soit prête (si nécessaire)
  // et on traite la requête
  try {
    return app(req, res);
  } catch (error) {
    console.error("Erreur d'invocation API:", error);
    res.status(500).json({ error: "Server Initialization Error" });
  }
};