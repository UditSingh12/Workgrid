# Workgrid Interview Prep

## Project Pitch

Workgrid is a multi-tenant B2B SaaS operations platform I built to simulate a production-style internal admin product. It supports secure workspace onboarding, role-aware access, client and project management, task workflows, billing visibility, activity logging, demo-mode seeding, CI automation, and Docker-based deployment.

## What makes it strong

- It is not just CRUD; it models tenant isolation and permissions.
- It includes production concerns like auth hardening, observability, health checks, and CI.
- It has a realistic product surface with analytics, archive/restore flows, and deployability.

## Common Interview Questions

### Why did you choose this architecture?

I wanted a clear separation between frontend routing, API logic, auth/permission middleware, and persistence so the project would resemble a real SaaS stack rather than a single-layer demo app.

### How is tenant data protected?

Every authenticated request resolves the user, membership, and organization context from signed tokens. Data queries are filtered by `organizationId`, and sensitive routes also require permission checks.

### Why add soft delete instead of hard delete?

In SaaS admin tools, recovery and auditability matter. Soft delete protects against accidental destructive actions while keeping archive/restore UX straightforward.

### What production features did you add beyond the core app?

I added Docker packaging, GitHub Actions CI, readiness and liveness health endpoints, request-level observability, metrics snapshots, and a demo-mode seed path for public showcase deployments.

### What would you improve next?

- stronger audit filtering and exports
- external monitoring integration such as Sentry or OpenTelemetry
- invitation workflow and email notifications
- automatic deployment after CI passes

## Tradeoff Discussion

- In-memory application state is still mirrored from Mongo for simplicity and speed of iteration.
- Metrics are lightweight JSON snapshots rather than a full Prometheus integration.
- Demo mode is environment-driven so it stays optional and safe to disable in private production deployments.
