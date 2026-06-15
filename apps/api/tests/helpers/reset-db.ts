import { db } from "../../src/data/mock-db.js";

export function resetDb() {
  db.organizations.splice(0, db.organizations.length);
  db.users.splice(0, db.users.length);
  db.memberships.splice(0, db.memberships.length);
  db.subscriptions.splice(0, db.subscriptions.length);
  db.clients.splice(0, db.clients.length);
  db.projects.splice(0, db.projects.length);
  db.tasks.splice(0, db.tasks.length);
  db.invoices.splice(0, db.invoices.length);
  db.activityLogs.splice(0, db.activityLogs.length);
  db.authSessions.splice(0, db.authSessions.length);
}
