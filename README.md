# EchoGPT Backend REST API

Production-ready backend API service for the **EchoGPT Chrome Extension**, engineered with **NestJS**, **Prisma ORM**, and **PostgreSQL**. Designed around clean modular architecture, role-based access control (RBAC), subscription quota governance, and resilient multi-provider AI routing.

---

## 🚀 Key Features

### 1. Authentication & Security (With Bonus)
* **Registration & Login:** Stateless JWT access authentication paired with database-persisted refresh token rotation.
* **Token Invalidation:** SHA-256 hashed refresh tokens enabling secure multi-session revocation upon logout or password change.
* **Role-Based Access Control:** Strict RBAC enforcing `USER` and `ADMIN` roles using custom metadata reflection guards (`@Roles(...)`).
* **Email Verification (Bonus Feature):** Cryptographic verification token generation (24-hour expiration lifecycle) with a non-blocking local delivery dispatcher logged to the console for testing.

### 2. User Management
* Profile inspection and metadata updates (`PATCH /api/v1/users/profile`).
* In-place password changes with automatic session revocation (`POST /api/v1/users/change-password`).
* Account deletion with cascading database cleanup (`DELETE /api/v1/users/account`).

### 3. Subscription & Quota Governance
* **Tier Enforcement:** Standard `FREE` (20 requests/day) and `PREMIUM` (500 requests/day) plans.
* **Automated Reset:** Rolling UTC calendar-day quota reset tracking.
* **Proactive Guard:** Custom `QuotaGuard` returning standard `HTTP 429 Too Many Requests` when limits are reached.
* Instant plan upgrade and downgrade endpoints (`/api/v1/subscriptions/upgrade`, `/api/v1/subscriptions/downgrade`).

### 4. AI Provider Management & Dual Execution Engine
* Multi-model provider support: **OpenAI**, **Anthropic Claude**, and **Google Gemini**.
* Admin-restricted CRUD for provider configurations with credential masking (`sk-p...xxxx`).
* **Resilient Dual Pattern:** Supports live API execution (Google Gemini 1.5) when `GEMINI_API_KEY` is present in `.env`, while seamlessly falling back to a deterministic simulation response if keys are omitted—enabling zero-setup evaluator testing.

### 5. Chat & Conversational Persistence
* Multi-turn message exchange history linked to specific conversation threads.
* Title generation and thread ownership isolation per user.
* Dynamic provider selection with automatic default model resolution.
* Approximate token estimation and consumption storage per interaction.

### 6. AI-Assisted Web Search
* Persistent query search history tracking with subscription quota deduction.
* Recent searches retrieval and prefix-based auto-complete suggestions.

### 7. Telemetry & Administrative Analytics
* Global interceptor logging request telemetry, response latencies, and HTTP status codes.
* Admin analytics dashboard aggregating system-wide metrics and performance stats.
* System health check probe (`GET /api/v1/health`) monitoring database connectivity.

---

## 🛠 Tech Stack

* **Framework:** NestJS (Node.js v18+)
* **Database:** PostgreSQL
* **ORM:** Prisma ORM v6
* **API Documentation:** OpenAPI / Swagger
* **Containerization:** Docker & Docker Compose
* **Language:** TypeScript

---

## 📦 Getting Started

### 1. Prerequisites
* Node.js (v18 or higher)
* Docker & Docker Compose (or local PostgreSQL)

### 2. Installation
```bash
git clone [https://github.com/TashrikZim/echogpt_backend.git](https://github.com/TashrikZim/echogpt_backend.git)
cd echogpt_backend
npm install
