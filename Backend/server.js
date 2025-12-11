// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import documentsRouter from "./routes/documents.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ensure upload directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// routes
app.use("/documents", documentsRouter);

// health
app.get("/", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${UPLOAD_DIR}`);
});
