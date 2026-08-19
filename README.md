# Data Room

Data Room is a secure document workspace for uploading PDF files, organizing them into folders, previewing files, and sharing access with other registered users or through authenticated shared links.

## Hosted URLs

- Frontend: https://data-room-git-main-petrotelishevskyis-projects.vercel.app
- Backend API: https://data-room-git-main-petrotelishevskyis-projects.vercel.app/api/v1

The current deployment uses Vercel with the backend mounted under the same origin at `/api/v1`.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query
- Backend: NestJS, TypeScript, Prisma
- Database: PostgreSQL
- File storage: Vercel Blob
- Deployment: Vercel

## Setup

### Prerequisites

- Node.js 22 or newer
- npm
- PostgreSQL database
- Vercel Blob read/write token

### Install dependencies

```bash
npm install
```

### Backend environment

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
FRONTEND_URL="http://localhost:5173"
AUTH_SECRET="replace-with-a-long-random-secret"

BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token"

UPLOAD_URL_TTL_SECONDS=600
READ_URL_TTL_SECONDS=300
MAX_FILE_SIZE_BYTES=104857600
```

### Frontend environment

Create `frontend/.env`:

```env
VITE_API_URL="http://localhost:3000/api/v1"
```

For the same-origin Vercel deployment, use:

```env
VITE_API_URL="/api/v1"
```

### Database migrations

Apply committed Prisma migrations:

```bash
cd backend
npm exec --package=prisma@6.19.3 -- prisma migrate deploy
```

Generate the Prisma client:

```bash
npm run prisma:generate -w backend
```

### Run locally

Start the backend:

```bash
npm run dev:backend
```

Start the frontend:

```bash
npm run dev:frontend
```

The frontend runs on `http://localhost:5173` and the backend API runs on `http://localhost:3000/api/v1`.

### Useful commands

```bash
npm run build:frontend
npm run build:backend
npm run lint:frontend
npm run lint:backend
```

## Design Decisions

- The project is a monorepo with separate `frontend` and `backend` workspaces. This keeps deployment and local development simple while still separating UI and API concerns.
- The backend is the source of truth for authorization. The frontend derives capabilities for UI state, but protected reads and mutations are enforced by NestJS services.
- Files are uploaded to private blob storage through signed upload URLs. The API stores metadata and opaque storage keys, but does not expose storage credentials.
- PDF viewing uses short-lived read URLs instead of proxying full file binaries through the backend.
- Folder hierarchy is modeled relationally with a self-referencing `folders` table. Files always belong to a folder and a data room.
- Sharing is modeled with one `shares` table that can target a data room, folder, or file. It supports direct user shares and public-link style shares.
- Public links in this implementation still require the visitor to be authenticated in the system. The link grants access scope, but the user must have an account/session.
- Vercel deployment is configured as a same-origin app where frontend routes and `/api/v1` backend routes live under one production domain.

## Data Model / ERD

```mermaid
erDiagram
  USER ||--o{ DATA_ROOM : owns
  USER ||--o{ SHARE : creates
  USER ||--o{ SHARE : receives

  DATA_ROOM ||--o{ FOLDER : contains
  DATA_ROOM ||--o{ FILE : contains
  DATA_ROOM ||--o{ SHARE : shared_as_target

  FOLDER ||--o{ FOLDER : parent_child
  FOLDER ||--o{ FILE : contains
  FOLDER ||--o{ SHARE : shared_as_target

  FILE ||--o{ SHARE : shared_as_target

  USER {
    string id PK
    string email UK
    string passwordHash
    string name
    datetime createdAt
    datetime updatedAt
  }

  DATA_ROOM {
    string id PK
    string name
    string ownerId FK
    datetime createdAt
    datetime updatedAt
  }

  FOLDER {
    string id PK
    string name
    string nameKey
    string kind
    string dataRoomId FK
    string parentId FK
    datetime createdAt
    datetime updatedAt
  }

  FILE {
    string id PK
    string name
    string nameKey
    string status
    string dataRoomId FK
    string folderId FK
    string storageKey UK
    string mimeType
    bigint sizeBytes
    datetime uploadedAt
    datetime createdAt
    datetime updatedAt
  }

  SHARE {
    string id PK
    string type
    string role
    string dataRoomId FK
    string folderId FK
    string fileId FK
    string recipientUserId FK
    string publicToken UK
    string createdById FK
    datetime revokedAt
    datetime createdAt
    datetime updatedAt
  }
```

Important constraints:

- A data room has one root folder.
- Folder names are unique within the same parent.
- File names are unique within the same folder.
- A share targets exactly one resource: data room, folder, or file.
- Direct user shares require `recipientUserId`.
- Public-link shares require `publicToken`.
- Public links are viewer-only at the database constraint level.

## How It Scales

### How do you compute the total size and item count of a folder including its whole subtree?

For an on-demand calculation, use a recursive PostgreSQL CTE starting from the selected folder, walk all descendant folders, then aggregate `files.sizeBytes` and file/folder counts for that folder set. Only `READY` files should be included in user-visible storage totals.

For frequent reads, the next step would be cached rollups: store `totalSizeBytes`, `fileCount`, and `folderCount` on each folder or in a separate aggregate table. Upload, delete, and move operations would update ancestors transactionally or enqueue a background recalculation. The relational model does not need to change.

### What changes when one Data Room holds 100,000 files?

The app should avoid loading a full data room at once. Listing should stay folder-scoped and use cursor pagination with stable ordering, for example `(folderId, nameKey, id)`. The schema already includes indexes for folder listing and data-room scoped lookup:

- `folders(dataRoomId, parentId)`
- `folders(parentId, nameKey, id)`
- `files(folderId, nameKey, id)`
- `files(dataRoomId, nameKey, id)`

At 100,000 files, the UI should use paginated lists, search/filter endpoints, and lazy folder expansion. Aggregate totals should be cached instead of recalculated for every page render. File bytes remain in blob storage, so database growth is mostly metadata and indexes.

### How does sharing extend to per-user roles without remodeling?

The `shares` table already has a `role` column with `VIEWER` and `EDITOR`. Authorization can resolve the best applicable share for a user and map the role to capabilities:

- `VIEWER`: read metadata, list folders, preview/download files
- `EDITOR`: viewer permissions plus allowed mutations such as upload, rename, move, or delete

Because shares already reference users and resources, adding editor behavior only requires extending the authorization checks and UI capability mapping. The database shape does not need to be remodeled.

## AI Usage

Whilst working on ImmigrateAI Global, I gained practical experience in integrating and utilising AI within a real-world SaaS product. Without disclosing internal business logic or details covered by an NDA, I can say that I worked on functionality where AI was used to process user content and documents, and to generate structured results based on the input data.

From a technical perspective, I worked on integrating AI APIs into the web product, preparing and transferring data between the front-end, back-end and AI services, processing model responses, validating results and subsequently displaying them in the user interface. I also worked on features related to PDF documents, AI-generated content and the automation of certain user workflows.

Particular attention was paid to ensuring that AI was not merely a separate feature, but an integral part of the product flow: the user enters or uploads information, the system processes it, the AI helps generate the result, after which this result undergoes further processing and is utilised within the product.

This experience has also given me an understanding of the practical aspects of working with LLMs in a production environment: structuring queries to the models, controlling the format of responses, handling errors, dealing with unreliable AI responses, integrating AI features with traditional business logic, and building an intuitive UX around AI functionality.

As well as product-based AI integrations, I actively use AI as a tool in my day-to-day development work. It helps me speed up code analysis, debugging, refactoring, working with documentation and APIs, generating boilerplate code, preparing test scenarios and rapid prototyping. This allows me to reduce the time spent on routine tasks and focus more on architecture, business logic and the quality of the final implementation.
