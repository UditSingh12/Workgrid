# Workgrid Deployment Guide

## Recommended Stack

- App hosting: Render, Railway, Fly.io, or a Docker VM
- Database: MongoDB Atlas
- TLS: platform-managed HTTPS
- Demo mode: enabled for public showcase environments only

## Render Setup

1. Push `Workgrid` to GitHub.
2. Create a new Render web service from the repository.
3. Use the included [render.yaml](../render.yaml).
4. Add a managed MongoDB Atlas connection string to `MONGODB_URI`.
5. Set `CLIENT_URL` to your final public app URL.
6. Set `DEMO_OWNER_PASSWORD` to a non-trivial demo password.
7. Deploy.

## Required Production Environment Variables

```env
NODE_ENV=production
PORT=4000
SERVE_STATIC_FRONTEND=true
CLIENT_URL=https://your-domain.com
JWT_SECRET=<long-random-secret>
REFRESH_TOKEN_SECRET=<long-random-secret>
MONGODB_URI=<mongodb-atlas-connection-string>
```

## Demo Environment Variables

```env
DEMO_MODE=true
DEMO_WORKSPACE_NAME=Workgrid Demo Workspace
DEMO_OWNER_NAME=Demo Operator
DEMO_OWNER_EMAIL=demo@workgrid.app
DEMO_OWNER_PASSWORD=<public-demo-password>
```

## Health and Observability Endpoints

- `/api/health`
- `/api/health/live`
- `/api/health/ready`
- `/api/health/metrics`

Use readiness for deployment health checks and metrics for lightweight operational visibility.
