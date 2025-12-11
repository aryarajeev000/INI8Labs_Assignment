// documents.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { initDb } from "../db.js";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // keep original name but add timestamp to avoid collisions
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760") }, // default 10MB
  fileFilter: function (req, file, cb) {
    // accept only PDFs
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

// POST /documents/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const db = await initDb();
    const stmt = await db.run(
      `INSERT INTO documents (filename, filepath, filesize, created_at) VALUES (?, ?, ?, datetime('now'))`,
      [req.file.originalname, req.file.filename, req.file.size]
    );
    const id = stmt.lastID;
    const doc = await db.get(`SELECT id, filename, filepath, filesize, created_at FROM documents WHERE id = ?`, [id]);
    res.json({ success: true, document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message ?? "Upload failed" });
  }
});

// GET /documents
router.get("/", async (req, res) => {
  try {
    const db = await initDb();
    const docs = await db.all(`SELECT id, filename, filepath, filesize, created_at FROM documents ORDER BY created_at DESC`);
    res.json({ documents: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// GET /documents/:id  (download)
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const db = await initDb();
    const doc = await db.get(`SELECT id, filename, filepath FROM documents WHERE id = ?`, [id]);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const filePath = path.join(UPLOAD_DIR, doc.filepath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found on server" });

    res.download(filePath, doc.filename);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// DELETE /documents/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const db = await initDb();
    const doc = await db.get(`SELECT id, filename, filepath FROM documents WHERE id = ?`, [id]);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const filePath = path.join(UPLOAD_DIR, doc.filepath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.run(`DELETE FROM documents WHERE id = ?`, [id]);
    res.json({ success: true, message: "Document deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
