# Design Document - Patient Document Portal

## Tech stack choices
- Frontend: React (Vite) — fast scaffolding, familiar, supports file upload UI.
- Backend: Node.js + Express — quick to implement REST endpoints; Multer for file upload.
- Database: SQLite — zero-setup, local file DB perfect for an assignment and development.
- Storage: Local `uploads/` folder as required.

## Architecture (overview)
Frontend (React)  <-->  Backend (Express)  <-->  SQLite (documents.db) + uploads/
Flow:
1. User uploads PDF via form -> frontend sends multipart/form-data POST to /documents/upload.
2. Backend stores file in uploads/ and inserts metadata in SQLite.
3. Frontend requests /documents to list documents.
4. Download request GET /documents/:id triggers server to send the PDF file.
5. Delete request DELETE /documents/:id removes file and DB metadata.

## API Specification
1. POST /documents/upload
   - Request: multipart/form-data (field: file)
   - Response:
     { success: true, document: { id, filename, filepath, filesize, created_at } }

2. GET /documents
   - Request: none
   - Response:
     { documents: [ { id, filename, filepath, filesize, created_at }, ... ] }

3. GET /documents/:id
   - Request: none
   - Response: PDF file download (Content-Disposition attachment; original filename)

4. DELETE /documents/:id
   - Request: none
   - Response:
     { success: true, message: "Document deleted" }

## Data Flow (upload)
1. Frontend creates FormData with file and sends POST /documents/upload.
2. Multer saves binary to uploads/ with unique filename.
3. Backend inserts metadata (original filename, saved filepath, filesize, created_at) into SQLite.
4. Backend returns inserted record to frontend.

## Data Flow (download)
1. Frontend calls GET /documents/:id.
2. Backend looks up DB for filepath; reads file and returns via res.download() with original filename.

## Assumptions
- Single-user system (no auth required).
- Max file size = 10MB (configurable).
- Only PDF files accepted.
- Files stored on local disk (no cloud storage).
- Concurrency: basic level handled by Node; for heavy concurrency would need object storage + DB scaling.

## Scaling notes (to support ~1,000 users)
- Move files to object storage (S3/Cloudinary).
- Move DB from SQLite to PostgreSQL.
- Add authentication & per-user folders / DB reference.
- Serve static files via CDN and enable signed URLs for downloads.
- Add background cleanup job and virus scanning (clamAV) for uploaded files.
