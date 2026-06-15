# Workgrid

Workgrid is a multi-tenant B2B SaaS admin platform built with React, Express, TypeScript, and MongoDB-ready persistence.

## Current Product Scope

- Workspace onboarding and login
- Role-aware tenant dashboard
- Clients, projects, tasks, billing, and activity feeds
- Secure password hashing with `bcryptjs`
- Signed auth tokens with `jsonwebtoken`
- MongoDB persistence with required database startup
- MongoDB-only backend mode

## Security Measures

- Passwords are hashed before storage
- Authenticated routes require signed bearer tokens
- Tenant data is filtered by `organizationId`
- Sensitive API routes use centralized auth middleware
- Production mode can serve frontend and API from one origin

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create API env

Copy `apps/api/.env.example` to `apps/api/.env` and set:

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/workgrid
SERVE_STATIC_FRONTEND=false
```

### 3. Start MongoDB

If you have Docker installed:

```bash
docker compose up mongo -d
```

### 4. Start the app

```bash
npm run dev:api
npm run dev:web
```

Frontend:

- [http://localhost:5173](http://localhost:5173)

API:

- [http://localhost:4000/api](http://localhost:4000/api)

## GitHub Actions CI/CD

Workgrid includes a GitHub Actions workflow that runs on every push and pull request to:

- install dependencies with `npm ci`
- run API and web tests
- run the full production build
- validate the Docker image can be built successfully

Workflow file:

- `.github/workflows/workgrid-ci.yml`

## Docker Run

### Start the whole stack

```bash
docker compose up --build
```

Open:

- [http://localhost:4000](http://localhost:4000)

This runs:

- MongoDB in one container
- The app in one container
- The frontend served by Express in production mode

## Cloud Deployment Steps

### Option 1: Docker on AWS EC2 / DigitalOcean / Azure VM

1. Create a Linux VM
2. Install Docker and Docker Compose
3. Clone this project
4. Set production values in `docker-compose.yml` or an env file
5. Run:

```bash
docker compose up -d --build
```

6. Open port `4000` in the firewall or place Nginx in front
7. Point your domain to the VM IP

### Option 2: Render / Railway / Fly.io

1. Push this repo to GitHub
2. Create a new service from the repo
3. Use the root `Dockerfile`
4. Set environment variables:
   - `PORT=4000`
   - `NODE_ENV=production`
   - `JWT_SECRET=<long-random-secret>`
   - `JWT_EXPIRES_IN=7d`
   - `MONGODB_URI=<managed-mongodb-connection-string>`
   - `SERVE_STATIC_FRONTEND=true`
   - `CLIENT_URL=<your-app-url>`
5. Deploy

### Option 3: MongoDB Atlas + App Container

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Add network access rules
4. Copy the Atlas connection string into `MONGODB_URI`
5. Deploy the Docker app to your cloud platform

## Production Notes

- Replace the default `JWT_SECRET`
- Use MongoDB Atlas or a secured private Mongo instance
- Put the app behind HTTPS in production
- Restrict MongoDB network access
- Add refresh tokens and HTTP-only cookies for stricter auth in the next phase
- Add rate limiting and request logging for public deployment

## Useful Commands

```bash
npm run build
npm run test
npm run test:api
npm run test:web
npm run start
docker compose up --build
docker compose down
```
