// server/middleware/cors.js
// --------------------------------------------------------------------
// Middleware CORS configurable.
// - allowedOrigin: origen permitido (por ejemplo "http://localhost:5173").
// - Expone métodos y headers comunes (incluye x-correlation-id).
// - Maneja requests preflight (OPTIONS) devolviendo 204 sin contenido.
// --------------------------------------------------------------------


import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Ruta ABSOLUTA hacia ../data/productos.json
const DATA_PATH = path.join(__dirname, "..", "data", "productos.json");

export async function listarProductos(req, res) {
  try {
    // Leer el archivo como string (UTF-8)
    const content = await readFile(DATA_PATH, "utf8");

    // Parsear JSON (si está corrupto, lanzará SyntaxError)
    const data = JSON.parse(content);

    // Normalización: solo campos necesarios y con nombres consistentes
    const out = (Array.isArray(data) ? data : []).map(
      ({ id, nombre, precio, stock }) => ({ id, nombre, precio, stock })
    );

    // Responder en formato estándar (útil para clientes)
    res.status(200).json({ status: "success", data: out });
  } catch (err) {
    // Errores comunes: ENOENT (no existe archivo) / SyntaxError (JSON inválido)
    console.error(`[${req.correlationId}] Error listando productos:`, err);
    res.status(500).json({
      status: "error",
      message:
        err.code === "ENOENT"
          ? `No se encontró el archivo de datos: ${DATA_PATH}`
          : `No se pudo leer el archivo de datos (${err.message})`,
    });
  }
} 