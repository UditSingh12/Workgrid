import type { Request, Response } from "express";

import { db } from "../../data/mock-db.js";

export function getBillingController(request: Request, response: Response) {
  const organizationId = request.auth!.organization.id;
  const subscription = db.subscriptions.find((item) => item.organizationId === organizationId);
  const invoices = db.invoices.filter((item) => item.organizationId === organizationId);
  const activity = db.activityLogs
    .filter((item) => item.organizationId === organizationId && item.entityType === "billing")
    .slice(0, 5);

  response.status(200).json({
    success: true,
    data: {
      subscription,
      invoices: invoices.map((invoice) => ({
        ...invoice,
        clientName: db.clients.find((client) => client.id === invoice.clientId)?.name ?? "Unknown client",
      })),
      metrics: {
        totalRevenue: invoices
          .filter((invoice) => invoice.status === "paid")
          .reduce((sum, invoice) => sum + invoice.amount, 0),
        outstandingRevenue: invoices
          .filter((invoice) => invoice.status !== "paid")
          .reduce((sum, invoice) => sum + invoice.amount, 0),
        paidInvoices: invoices.filter((invoice) => invoice.status === "paid").length,
      },
      activity,
    },
  });
}
