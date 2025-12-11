# Patient Document Portal - Full Stack (Local)

Simple full-stack app for uploading, listing, downloading, and deleting PDF documents.

## Prerequisites
- Node.js (v16+)
- npm

## Backend (express + sqlite)
1. Open terminal → `cd backend`
2. Install: `npm install`
3. Create `.env` (optional) or use default:
   - PORT (default 4000)
   - UPLOAD_DIR (default ./uploads)
   - MAX_FILE_SIZE (bytes, default 10485760)

4. Start server:
   - `npm run dev` (nodemon) or `npm start`
5. Backend runs at `http://localhost:4000`

Endpoints:
- `POST /documents/upload` — multipart form field `file` (PDF)
- `GET  /documents` — list metadata
- `GET  /documents/:id` — download
- `DELETE /documents/:id` — delete

## Frontend (React + Vite)
1. Open new terminal → `cd frontend`
2. Install: `npm install`
3. Start dev server: `npm run dev`
4. Frontend runs at `http://localhost:5173` (Vite default)

Frontend expects backend at `http://localhost:4000`. To change, set `VITE_API_BASE` env var.

## Quick test via curl
Upload:
curl -F "file=@/path/to/file.pdf" http://localhost:4000/documents/upload

List:


curl http://localhost:4000/documents

Download:


curl -OJ http://localhost:4000/documents/1

Delete:


curl -X DELETE http://localhost:4000/documents/1


## Notes
- SQLite DB file `documents.db` is created in backend folder.
- Uploaded files saved in `uploads/` inside backend folder.

## Architecture
                         ┌──────────────────────────┐
                         │        Frontend UI        │
                         │     React / Next.js       │
                         │                           │
                         │ • Upload PDFs             │
                         │ • Manage documents        │
                         │ • Dashboard analytics     │
                         └───────────────▲──────────┘
                                         │ HTTPS
                                         ▼
                ┌───────────────────────────────────────────────┐
                │            API Gateway / Load Balancer         │
                │        (NGINX / AWS ALB / Cloudflare)          │
                └─────────────────────┬─────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
          ┌─────────────────────┐             ┌──────────────────────┐
          │ Document Service     │             │ Analytics Service     │
          │ (Express / NestJS)   │             │ (Node / Python)       │
          │                      │             │                        │
          │ • Upload PDF         │             │ • Stats aggregation    │
          │ • Validate & store   │             │ • Dashboard metrics    │
          │ • Metadata handling  │             │ • Cron jobs            │
          │ • Token auth (future)│             │                        │
          └──────────┬──────────┘             └────────────┬──────────┘
                     │                                       │
                     ▼                                       ▼
       ┌────────────────────────┐              ┌─────────────────────────┐
       │  Object Storage (S3)   │              │   PostgreSQL / MySQL    │
       │ • Stores PDFs safely   │              │ • Metadata records       │
       │ • Signed URLs          │              │ • Users, roles, sharing  │
       └──────────▲─────────────┘              └──────────▲──────────────┘
                  │                                        │
                  └───────────┬────────────────────────────┘
                              │
                     ┌────────▼─────────┐
                     │   Redis Cache    │
                     │ • Recently used  │
                     │ • Performance    │
                     └──────────────────┘
