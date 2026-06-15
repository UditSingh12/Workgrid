import mongoose, { Schema, model } from "mongoose";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { db } from "./mock-db.js";
import type {
  ActivityLog,
  AuthSession,
  Client,
  Invoice,
  Membership,
  Organization,
  Project,
  Subscription,
  Task,
  User,
} from "../shared/types.js";

const organizationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    slug: String,
    plan: String,
    industry: String,
    timezone: String,
    currency: String,
    createdAt: String,
  },
  { versionKey: false },
);

const userSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    email: String,
    title: String,
    password: String,
    createdAt: String,
  },
  { versionKey: false },
);

const membershipSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: String,
    organizationId: String,
    role: String,
    permissions: [String],
    status: String,
  },
  { versionKey: false },
);

const clientSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organizationId: String,
    name: String,
    status: String,
    accountManager: String,
    deletedAt: String,
  },
  { versionKey: false },
);

const projectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organizationId: String,
    clientId: String,
    name: String,
    status: String,
    ownerId: String,
    health: String,
    deletedAt: String,
  },
  { versionKey: false },
);

const taskSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organizationId: String,
    projectId: String,
    title: String,
    status: String,
    assigneeId: String,
    dueDate: String,
    deletedAt: String,
  },
  { versionKey: false },
);

const subscriptionSchema = new Schema(
  {
    organizationId: { type: String, required: true, unique: true },
    plan: String,
    seats: Number,
    status: String,
    renewalDate: String,
  },
  { versionKey: false },
);

const invoiceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organizationId: String,
    clientId: String,
    projectId: String,
    amount: Number,
    currency: String,
    status: String,
    issuedAt: String,
    dueAt: String,
  },
  { versionKey: false },
);

const activityLogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organizationId: String,
    actorName: String,
    action: String,
    entityType: String,
    entityName: String,
    createdAt: String,
  },
  { versionKey: false },
);

const authSessionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: String,
    organizationId: String,
    membershipId: String,
    refreshTokenHash: String,
    createdAt: String,
    expiresAt: String,
  },
  { versionKey: false },
);

const OrganizationModel = model("Organization", organizationSchema);
const UserModel = model("User", userSchema);
const MembershipModel = model("Membership", membershipSchema);
const ClientModel = model("Client", clientSchema);
const ProjectModel = model("Project", projectSchema);
const TaskModel = model("Task", taskSchema);
const SubscriptionModel = model("Subscription", subscriptionSchema);
const InvoiceModel = model("Invoice", invoiceSchema);
const ActivityLogModel = model("ActivityLog", activityLogSchema);
const AuthSessionModel = model("AuthSession", authSessionSchema);

export async function initializeDatabase() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. The app now runs in MongoDB-only mode.");
  }

  await mongoose.connect(env.MONGODB_URI);
  logger.info("MongoDB connected");

  db.organizations.splice(0, db.organizations.length, ...((await OrganizationModel.find().lean()) as unknown as Organization[]));
  db.users.splice(0, db.users.length, ...((await UserModel.find().lean()) as unknown as User[]));
  db.memberships.splice(0, db.memberships.length, ...((await MembershipModel.find().lean()) as unknown as Membership[]));
  db.clients.splice(0, db.clients.length, ...((await ClientModel.find().lean()) as unknown as Client[]));
  db.projects.splice(0, db.projects.length, ...((await ProjectModel.find().lean()) as unknown as Project[]));
  db.tasks.splice(0, db.tasks.length, ...((await TaskModel.find().lean()) as unknown as Task[]));
  db.subscriptions.splice(0, db.subscriptions.length, ...((await SubscriptionModel.find().lean()) as unknown as Subscription[]));
  db.invoices.splice(0, db.invoices.length, ...((await InvoiceModel.find().lean()) as unknown as Invoice[]));
  db.activityLogs.splice(
    0,
    db.activityLogs.length,
    ...((await ActivityLogModel.find().sort({ createdAt: -1 }).lean()) as unknown as ActivityLog[]),
  );
  db.authSessions.splice(0, db.authSessions.length, ...((await AuthSessionModel.find().lean()) as unknown as AuthSession[]));
  logger.info("MongoDB state loaded into application memory", {
    organizations: db.organizations.length,
    users: db.users.length,
    clients: db.clients.length,
    projects: db.projects.length,
    tasks: db.tasks.length,
  });
}

export function persistOrganization(record: Organization) {
  void OrganizationModel.findOneAndUpdate({ id: record.id }, record as unknown as Record<string, unknown>, { upsert: true }).exec();
}

export function persistUser(record: User) {
  void UserModel.findOneAndUpdate({ id: record.id }, record as unknown as Record<string, unknown>, { upsert: true }).exec();
}

export function persistMembership(record: Membership) {
  void MembershipModel.findOneAndUpdate({ id: record.id }, record as unknown as Record<string, unknown>, { upsert: true }).exec();
}

export function persistClient(record: Client) {
  void ClientModel.findOneAndUpdate({ id: record.id }, record as unknown as Record<string, unknown>, { upsert: true }).exec();
}

export function persistProject(record: Project) {
  void ProjectModel.findOneAndUpdate({ id: record.id }, record as unknown as Record<string, unknown>, { upsert: true }).exec();
}

export function persistTask(record: Task) {
  void TaskModel.findOneAndUpdate({ id: record.id }, record as unknown as Record<string, unknown>, { upsert: true }).exec();
}

export function persistSubscription(record: Subscription) {
  void SubscriptionModel.findOneAndUpdate(
    { organizationId: record.organizationId },
    record as unknown as Record<string, unknown>,
    { upsert: true },
  ).exec();
}

export function persistInvoice(record: Invoice) {
  void InvoiceModel.findOneAndUpdate({ id: record.id }, record as unknown as Record<string, unknown>, { upsert: true }).exec();
}

export function persistActivityLog(record: ActivityLog) {
  void ActivityLogModel.findOneAndUpdate({ id: record.id }, record as unknown as Record<string, unknown>, { upsert: true }).exec();
}

export function persistAuthSession(record: AuthSession) {
  void AuthSessionModel.findOneAndUpdate({ id: record.id }, record as unknown as Record<string, unknown>, { upsert: true }).exec();
}

export function deleteAuthSession(sessionId: string) {
  void AuthSessionModel.deleteOne({ id: sessionId }).exec();
}
