import { useEffect, useState } from "react";

import { api } from "../lib/api";
import { useSession } from "../shared/session";
import { SectionCard } from "../shared/components/section-card";
import { StatusPanel } from "../shared/components/status-panel";

export function BillingPage() {
  const { session } = useSession();
  const [billing, setBilling] = useState<Awaited<ReturnType<typeof api.getBilling>> | null>(null);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof api.getActivity>>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.token) {
      setBilling(null);
      setActivity([]);
      return;
    }

    Promise.all([api.getBilling(session.token), api.getActivity(session.token)])
      .then(([billingData, activityData]) => {
        setBilling(billingData);
        setActivity(activityData);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load billing"));
  }, [session]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Billing</p>
          <h2>Plans, subscriptions, and revenue operations</h2>
        </div>
      </header>

      <div className="two-column-grid">
        <SectionCard
          title="Subscription management"
          description="This page now loads live subscription, invoice, and revenue data."
        >
          {!session ? (
            <StatusPanel title="Authentication required" tone="danger">
              Sign in on the Auth page to load billing details.
            </StatusPanel>
          ) : billing ? (
            <ul className="list">
              <li>Plan: {billing.subscription.plan}</li>
              <li>Seats: {billing.subscription.seats}</li>
              <li>Status: {billing.subscription.status}</li>
              <li>Total revenue: {billing.metrics.totalRevenue.toLocaleString()} INR</li>
              <li>Outstanding: {billing.metrics.outstandingRevenue.toLocaleString()} INR</li>
            </ul>
          ) : (
            <p className="muted">Loading billing...</p>
          )}
        </SectionCard>

        <SectionCard
          title="Invoice operations"
          description="Invoices are now exposed through a billing API and linked to tenant clients."
        >
          <ul className="list">
            {billing?.invoices.map((invoice) => (
              <li key={invoice.id}>
                {invoice.clientName} - {invoice.amount.toLocaleString()} {invoice.currency} - {invoice.status}
              </li>
            )) ?? <li>Sign in to view invoices.</li>}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent activity"
        description="A tenant activity stream helps the billing area feel more like real SaaS operations."
      >
        <ul className="list">
          {activity.map((item) => (
            <li key={item.id}>
              {item.actorName} - {item.action} - {item.entityName}
            </li>
          ))}
        </ul>
        {error ? <StatusPanel title="Error" tone="danger">{error}</StatusPanel> : null}
      </SectionCard>
    </div>
  );
}
