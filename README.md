<<<<<<< HEAD
# global-learning-analytics-dashboard
Full-stack JavaScript dashboard for learning analytics. Features secure REST APIs (Node.js, MongoDB), interactive KPI/trend visualizations (React, Chart.js), and a TensorFlow.js recommendation engine. Containerized with Docker, documented with OpenAPI, and tested with Jest/Vitest.
=======
# Global Learning Analytics Dashboard

Global Learning Analytics Dashboard — insight, recommendations, and trends for
learning platforms.

[![Build](https://img.shields.io/badge/build-docker--compose-blue)](#)
[![Tests](https://img.shields.io/badge/tests-jest%20%7C%20vitest-brightgreen)](#)
[![License](https://img.shields.io/badge/license-TBD-lightgrey)](#)

———

## At a glance

- Full‑stack JavaScript: React + Node/Express + MongoDB.
- Event ingestion with KPIs, trends, and popular courses.
- JWT auth with refresh tokens; passwords hashed with bcrypt.
- Personalized recommendations (user‑based CF + tag boost) with reasons.
- Dockerized development; seed script generates realistic data.

———

## Feature highlights

| Area          | Details                                                                 |
|---------------|-------------------------------------------------------------------------|
| Auth          | JWT access + refresh tokens, bcrypt password hashing                    |
| Analytics     | Bulk event ingest, KPIs, trends by day/week/month, popular courses      |
| Recommend     | User‑based CF + tag matching; returns Top‑N with human‑readable reasons |
| API Docs      | OpenAPI YAML at `packages/server/src/docs/openapi.yaml`                 |
| Testing       | Backend: Jest + Supertest + in‑memory Mongo; Frontend: Vitest + RTL     |
| Containers    | Server/Client Dockerfiles; `docker-compose.yml` with MongoDB            |

———

## Architecture

We separate models, services, controllers, and routes. Analytics aggregates are
computed in MongoDB; recommendations use a simple user‑based collaborative
filtering baseline and tag overlap for explainability.

```
Client (React)
   │  REST (JWT)
   ▼
Node/Express ──► Analytics svc ──► MongoDB (Events, Users, Courses, Enrollments)
   │                                ▲
   └──────────► Recommend svc (user CF + tags) ───────────────┘
``

———

## Quickstart

Here’s the 60‑second path to running locally.

```bash
# 1) Clone
git clone https://github.com/<YOUR_ORG>/global-learning-analytics-dashboard.git
cd global-learning-analytics-dashboard

# 2) Configure env
cp .env.example .env

# 3) Install deps (server + client)
npm i -w packages/server && npm i -w packages/client

# 4) Seed the database (creates users/courses/events)
npm run seed

# 5) Start with Docker (recommended)
docker-compose up --build

# Or run in dev mode separately
npm run dev:server  # http://localhost:8080
npm run dev:client  # http://localhost:5173
```

> Note — Replace `<YOUR_ORG>` above with your GitHub org/user. If you customize
> API base URLs, set `VITE_API_BASE` in `.env` before `docker-compose up`.

First login (seeded):
- Email: `user1@example.com`
- Password: `password123`

———

## Usage

- Open http://localhost:5173 and log in with a seeded user.
- Dashboard: view KPIs, switch metric (watch_time/completion_rate) and bucket
  (day/week/month).
- Courses: browse the catalog and enroll with one click.
- Recommend: see Top‑N personalized suggestions with short reasons.

Screenshots live in `docs/media/`. Add yours to make this section shine.

———

## API

- OpenAPI spec: `packages/server/src/docs/openapi.yaml`
- When running, the spec is also served at: `http://localhost:8080/api/docs/openapi.yaml`

Representative requests:

```bash
# Login and capture token
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user1@example.com","password":"password123"}'

# KPIs (requires Authorization header)
curl -s http://localhost:8080/api/analytics/kpis \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Additional endpoints include `/api/analytics/trends`, `/api/analytics/popular`,
and `/api/recommend/me?top=10`. See the OpenAPI file for schemas and examples.

———

## Configuration

Server and client read environment variables from `.env` (local) and from
Compose service env (Docker). Defaults mirror `.env.example`.

| Variable           | Required | Default                                  | Description                          |
|--------------------|----------|------------------------------------------|--------------------------------------|
| `NODE_ENV`         | no       | `development`                            | Runtime mode                         |
| `PORT`             | no       | `8080`                                   | API port                             |
| `MONGO_URI`        | yes      | `mongodb://localhost:27017/analyticsdb`  | MongoDB connection string            |
| `JWT_SECRET`       | yes      | —                                        | Token signing key                    |
| `ACCESS_TOKEN_TTL` | no       | `15m`                                    | Access token lifetime                |
| `REFRESH_TOKEN_TTL`| no       | `7d`                                     | Refresh token lifetime               |
| `CLIENT_URL`       | no       | `http://localhost:5173`                  | CORS allow‑origin for the client     |
| `SERVER_URL`       | no       | `http://localhost:8080`                  | Server base URL (informational)      |
| `VITE_API_BASE`    | no       | `http://localhost:8080/api`              | Frontend API base URL                |

Production notes:
- Docker Compose sets reasonable production defaults for the server container.
- If you deploy elsewhere, set `NODE_ENV=production` and a strong `JWT_SECRET`.

———

## Testing

Backend (Jest):

```bash
npm run test -w packages/server
```

Frontend (Vitest + RTL):

```bash
npm run test -w packages/client
```

Core assertions include:
- Auth flow: register → login → refresh → `GET /users/me`.
- Analytics: KPIs shape, trends series, popular courses list.
- Recommend: returns Top‑N items and includes a `reason` field.
- Frontend: routes render; protected routes redirect when unauthenticated.

———

## Performance & limits

- Seed volume: ~200+ users, 50+ courses, and 5k–20k events. Suitable for demos.
- Cold start: first aggregate queries may take a moment on fresh databases.
- Recommender: user‑based CF is simple and explainable; not tuned for large scale.
- Known constraints: no background jobs; all analytics run on request.

———

## Roadmap

- [ ] Kafka/streaming ingestion (optional)
- [ ] A/B testing and experiment flags
- [ ] Multi‑DC deployment guidance
- [ ] Feature store integration
- [ ] TensorFlow.js matrix factorization (experimental)
- [ ] Built‑in Swagger UI endpoint

———

## Contributing

We welcome issues and pull requests. Please:
- Keep changes focused; include tests where relevant.
- Follow the existing project structure and linting (ESLint + Prettier).
- Describe user impact and testing steps in your PR.

———

## License

License: TBD. Choose and add a `LICENSE` file before distribution.

———

## Credits

- React, Vite, React Router, TanStack Query, Chart.js, Tailwind CSS
- Node.js, Express, Mongoose
- Jest, Supertest, Vitest, Testing Library, mongodb‑memory‑server
- Faker.js

> This demo uses randomly generated seed data. Do not use in production.
>>>>>>> 5f45a0c (Initial commit: full-stack learning analytics dashboard)
