import { useEffect, useState } from "react";

import { api, type ClientRecord } from "../lib/api";
import { useSession } from "../shared/session";
import { SectionCard } from "../shared/components/section-card";
import { StatusPanel } from "../shared/components/status-panel";

export function ClientsPage() {
  const { session } = useSession();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [archivedClients, setArchivedClients] = useState<ClientRecord[]>([]);
  const [form, setForm] = useState({ name: "", status: "lead" as "active" | "lead", accountManager: "" });
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadClients(token: string) {
    const [activeClientList, archivedClientList] = await Promise.all([
      api.getClients(token),
      api.getArchivedClients(token),
    ]);
    setClients(activeClientList);
    setArchivedClients(archivedClientList);
  }

  useEffect(() => {
    if (!session?.token) {
      setClients([]);
      setArchivedClients([]);
      return;
    }

    loadClients(session.token)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load clients"));
  }, [session]);

  useEffect(() => {
    if (!session?.user.name) {
      return;
    }

    setForm((current) => ({
      ...current,
      accountManager: current.accountManager || session.user.name,
    }));
  }, [session]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.token) {
      setError("Please sign in first.");
      return;
    }

    const payload = {
      ...form,
      accountManager: form.accountManager?.trim() || session.user.name,
    };

    setError("");
    setMessage("");
    if (editingClientId) {
      const updatedClient = await api
        .updateClient(session.token, editingClientId, payload)
        .catch((requestError) => {
          setError(requestError instanceof Error ? requestError.message : "Could not update client");
          return null;
        });

      if (!updatedClient) {
        return;
      }

      setClients((current) => current.map((client) => (client.id === updatedClient.id ? updatedClient : client)));
      setMessage(`Client ${updatedClient.name} updated.`);
      setEditingClientId(null);
    } else {
      const createdClient = await api.createClient(session.token, payload).catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Could not create client");
        return null;
      });

      if (!createdClient) {
        return;
      }

      setClients((current) => [...current, createdClient]);
      setMessage(`Client ${createdClient.name} created.`);
    }

    setForm({ name: "", status: "lead", accountManager: session.user.name });
  }

  async function handleArchive(clientId: string) {
    if (!session?.token) {
      return;
    }

    setError("");
    setMessage("");

    const archivedClient = await api.archiveClient(session.token, clientId).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : "Could not archive client");
      return null;
    });

    if (!archivedClient) {
      return;
    }

    setClients((current) => current.filter((client) => client.id !== clientId));
    setArchivedClients((current) => [archivedClient, ...current]);
    setMessage(`Client ${archivedClient.name} archived.`);
    if (editingClientId === clientId) {
      setEditingClientId(null);
      setForm({ name: "", status: "lead", accountManager: session.user.name });
    }
  }

  async function handleRestore(clientId: string) {
    if (!session?.token) {
      return;
    }

    setError("");
    setMessage("");

    const restoredClient = await api.restoreClient(session.token, clientId).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : "Could not restore client");
      return null;
    });

    if (!restoredClient) {
      return;
    }

    setArchivedClients((current) => current.filter((client) => client.id !== clientId));
    setClients((current) => [restoredClient, ...current]);
    setMessage(`Client ${restoredClient.name} restored.`);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Clients</p>
          <h2>Customer accounts and relationship tracking</h2>
        </div>
      </header>

      <SectionCard
        title="Client operations"
        description="Create, update, archive, and restore customer accounts with workspace-scoped permissions."
      >
        {!session ? (
          <StatusPanel title="Authentication required" tone="danger">
            Sign in on the Auth page to load and create tenant clients.
          </StatusPanel>
        ) : (
          <div className="two-column-grid">
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Client name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as "active" | "lead" })}
                >
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                </select>
              </label>
              <label>
                Account manager
                <input
                  value={form.accountManager}
                  onChange={(event) => setForm({ ...form, accountManager: event.target.value })}
                  placeholder={session.user.name}
                />
              </label>
              <button className="primary-button" type="submit">
                {editingClientId ? "Update client" : "Create client"}
              </button>
            </form>

            <div>
              <div className="table-like-list">
                {clients.map((client) => (
                  <div className="entity-card" key={client.id}>
                    <div>
                      <strong>{client.name}</strong>
                      <p>{client.status} account</p>
                      <small>Owner: {client.accountManager}</small>
                    </div>
                    <div className="entity-actions">
                      <button
                        className="inline-button"
                        type="button"
                        onClick={() => {
                          setEditingClientId(client.id);
                          setForm({
                            name: client.name,
                            status: client.status as "active" | "lead",
                            accountManager: client.accountManager,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button className="inline-button inline-button-danger" type="button" onClick={() => handleArchive(client.id)}>
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {message ? <StatusPanel title="Saved" tone="success">{message}</StatusPanel> : null}
        {error ? <StatusPanel title="Error" tone="danger">{error}</StatusPanel> : null}
      </SectionCard>

      <SectionCard
        title="Archived clients"
        description="Soft-deleted records stay recoverable instead of being permanently removed."
      >
        {archivedClients.length === 0 ? (
          <p className="muted">No archived clients yet.</p>
        ) : (
          <div className="table-like-list">
            {archivedClients.map((client) => (
              <div className="entity-card archived" key={client.id}>
                <div>
                  <strong>{client.name}</strong>
                  <p>{client.status} account</p>
                  <small>Archived record available for restore</small>
                </div>
                <div className="entity-actions">
                  <button className="inline-button inline-button-success" type="button" onClick={() => handleRestore(client.id)}>
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
