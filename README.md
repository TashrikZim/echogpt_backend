# EchoGPT Backend REST API

Production-ready backend API service for the **EchoGPT Chrome Extension**, engineered with **NestJS**, **Prisma ORM**, and **PostgreSQL (Docker)**. Designed around clean modular architecture, role-based access control (RBAC), and strict API quota governance.

---

## 🚀 Key Features

* **Authentication & Identity**:
  * Registration, login, and secure logout.
  * Stateless JWT access token authentication paired with database-backed refresh token rotation.
  * Password hashing via `bcrypt`.
* **User Management**:
  * Profile viewing and self-updates (`PATCH /api/v1/users/profile`).
  * In-place password changes with session revocation (`POST /api/v1/users/change-password`).
  * Account deletion with cascading database cleanup (`DELETE /api/v1/users/account`).
  * Strict Role-Based Access Control (`USER` vs `ADMIN`).
* **Subscription & Usage Governance**:
  * Tier enforcement (`FREE`: 20 requests/day, `PREMIUM`: 500 requests/day).
  * Automated UTC calendar-day quota reset.
  * Reusable `QuotaGuard` returning standard `429 Too Many Requests` on quota exhaustion.
  * Instant plan upgrade and downgrade endpoints.
* **AI Provider Management**:
  * Multi-provider support for **OpenAI**, **Anthropic Claude**, and **Google Gemini**.
  * Admin-restricted CRUD for provider configurations.
  * Active/Default toggles and secure masking of API credentials in responses.
  * Provider health-check probes (`GET /api/v1/ai-providers/:id/health`).
* **Chat Engine**:
  * Multi-turn conversational persistence.
  * Flexible provider selection with automatic default fallback.
  * Token usage estimation and storage per message.
* **Web Search Engine**:
  * Persistent query tracking with quota deduction.
  * Recent searches retrieval and prefix-based auto-complete suggestions.
* **Telemetry & Analytics**:
  * Global `LoggingInterceptor` capturing request latency and status codes.
  * Admin analytics dashboard displaying platform metrics and latency averages.
  * System health check probe at `GET /api/v1/health`.

---

## 🛠 Tech Stack

* **Framework**: NestJS (Node.js v20+)
* **Database**: PostgreSQL
* **ORM**: Prisma ORM v6
* **API Documentation**: OpenAPI / Swagger
* **Containerization**: Docker & Docker Compose
* **Language**: TypeScript

---

## 📦 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [Docker Desktop](https://www.docker.com/)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <YOUR_REPO_URL>
cd echogpt-backend
npm install
```

### 3. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```

### 4. Database Setup via Docker
Start the PostgreSQL container:
```bash
docker compose up -d
```

### 5. Run Database Migrations & Seed
Apply database schema migrations and seed initial default providers and the administrator account:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 6. Start the Server
```bash
# Development watch mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3000/api/v1`

---

## 📖 Interactive API Documentation (Swagger)

Full interactive OpenAPI documentation with Bearer token authentication support is available at:
👉 **`http://localhost:3000/api/docs`**

### Pre-seeded Credentials for Reviewers

#### Administrator Account:
* **Email:** `admin@echogpt.com`
* **Password:** `Admin@123456`
* **Role:** `ADMIN` (Access to Analytics, AI Provider Management, etc.)
* **Plan:** `PREMIUM` (500 requests/day)

---

## 🏗 Database Schema Architecture

The PostgreSQL database is normalized into 8 primary entities:
1. `User`: Core identity, roles (`USER`, `ADMIN`).
2. `RefreshToken`: Secure token rotation and session revocation tracking.
3. `Subscription`: Plan limits (`FREE`, `PREMIUM`), daily usage counters, and reset dates.
4. `AiProvider`: Multi-model configurations, credentials, and default flags.
5. `Conversation`: Chat threads linked to users.
6. `ChatMessage`: Multi-turn message exchange history with token accounting.
7. `WebSearch`: Search queries and serialized results.
8. `ApiUsageLog`: Request telemetry, response latency, and status codes.

---

## 🧪 Submission Verification Checklist

* [x] RESTful API routes under `/api/v1`
* [x] Complete interactive Swagger docs at `/api/docs`
* [x] JWT + Refresh Token auth cycle with bcrypt encryption
* [x] Full RBAC protection on administrative endpoints
* [x] Subscription tier quota limits returning HTTP 429
* [x] Automated Prisma database seeder (`prisma/seed.ts`)
* [x] System and database health check (`/api/v1/health`)
* [x] Docker Compose configuration for clean environment replication
