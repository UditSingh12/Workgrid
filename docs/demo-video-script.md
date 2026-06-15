# Workgrid Demo Video Script

## Goal

Record a concise 2-minute product and engineering demo for recruiters, portfolio viewers, and interviews.

## Structure

### 1. Intro - 10 seconds

Say:

"Workgrid is a multi-tenant B2B SaaS operations platform I built to manage clients, projects, tasks, billing, and secure workspace access from one admin dashboard."

Show:

- README hero on GitHub
- live app landing page

### 2. Auth and tenant isolation - 20 seconds

Say:

"The platform supports multi-tenant onboarding, JWT access control, HTTP-only refresh tokens, and route-level permissions."

Show:

- Auth page
- demo credentials card
- successful sign-in

### 3. Core operations - 35 seconds

Say:

"Users can create and manage clients, projects, and tasks, with soft delete and restore built into each workflow."

Show:

- create a client
- archive a client
- restore a client
- create a project and task

### 4. Analytics and billing - 25 seconds

Say:

"The overview dashboard surfaces delivery health, task distribution, revenue snapshots, and archived entity counts."

Show:

- overview charts
- billing page
- activity feed

### 5. Production mindset - 20 seconds

Say:

"I also added MongoDB persistence, GitHub Actions CI, Docker packaging, health checks, and observability endpoints to make it deployment-ready."

Show:

- GitHub Actions tab
- Dockerfile
- `/api/health/ready`
- `/api/health/metrics`

### 6. Wrap-up - 10 seconds

Say:

"Workgrid demonstrates full-stack SaaS architecture, secure auth, operational UX, and production-focused engineering decisions."

## Recording Tips

- Keep the browser zoom at 100% or 110%
- Use one clean demo account only
- Reset data before recording if needed
- Keep total runtime between 90 and 150 seconds
