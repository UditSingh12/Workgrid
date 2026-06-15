import { useEffect, useState } from "react";

import { api, type TaskRecord } from "../lib/api";
import { useSession } from "../shared/session";
import { SectionCard } from "../shared/components/section-card";
import { StatusPanel } from "../shared/components/status-panel";

export function TasksPage() {
  const { session } = useSession();
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<TaskRecord[]>([]);
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    status: "backlog" as "backlog" | "in_progress" | "review" | "completed",
    dueDate: "",
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTasks(token: string) {
    const [projectList, taskList, archivedTaskList] = await Promise.all([
      api.getProjects(token),
      api.getTasks(token),
      api.getArchivedTasks(token),
    ]);

    setProjects(projectList.map((project) => ({ id: project.id, name: project.name })));
    setTasks(taskList);
    setArchivedTasks(archivedTaskList);
    if (projectList[0]) {
      setForm((current) => ({ ...current, projectId: current.projectId || projectList[0].id }));
    }
  }

  useEffect(() => {
    if (!session?.token) {
      setTasks([]);
      setArchivedTasks([]);
      setProjects([]);
      return;
    }

    loadTasks(session.token)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load tasks"));
  }, [session]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.token) {
      setError("Please sign in first.");
      return;
    }

    setError("");
    setMessage("");

    if (editingTaskId) {
      const updatedTask = await api.updateTask(session.token, editingTaskId, form).catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Could not update task");
        return null;
      });

      if (!updatedTask) {
        return;
      }

      const projectName = projects.find((project) => project.id === updatedTask.projectId)?.name ?? "Unknown project";
      setTasks((current) =>
        current.map((task) => (task.id === updatedTask.id ? { ...updatedTask, projectName } : task)),
      );
      setMessage(`Task ${updatedTask.title} updated.`);
      setEditingTaskId(null);
    } else {
      const createdTask = await api.createTask(session.token, form).catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Could not create task");
        return null;
      });

      if (!createdTask) {
        return;
      }

      const projectName = projects.find((project) => project.id === createdTask.projectId)?.name ?? "Unknown project";
      setTasks((current) => [...current, { ...createdTask, projectName }]);
      setMessage(`Task ${createdTask.title} created.`);
    }

    setForm((current) => ({
      ...current,
      title: "",
      status: "backlog",
      dueDate: "",
    }));
  }

  async function handleArchive(taskId: string) {
    if (!session?.token) {
      return;
    }

    setError("");
    setMessage("");

    const archivedTask = await api.archiveTask(session.token, taskId).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : "Could not archive task");
      return null;
    });

    if (!archivedTask) {
      return;
    }

    const projectName = projects.find((project) => project.id === archivedTask.projectId)?.name ?? "Unknown project";
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setArchivedTasks((current) => [{ ...archivedTask, projectName }, ...current]);
    setMessage(`Task ${archivedTask.title} archived.`);
  }

  async function handleRestore(taskId: string) {
    if (!session?.token) {
      return;
    }

    setError("");
    setMessage("");

    const restoredTask = await api.restoreTask(session.token, taskId).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : "Could not restore task");
      return null;
    });

    if (!restoredTask) {
      return;
    }

    const projectName = projects.find((project) => project.id === restoredTask.projectId)?.name ?? "Unknown project";
    setArchivedTasks((current) => current.filter((task) => task.id !== taskId));
    setTasks((current) => [{ ...restoredTask, projectName }, ...current]);
    setMessage(`Task ${restoredTask.title} restored.`);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Tasks</p>
          <h2>Delivery board and task execution</h2>
        </div>
      </header>

      <div className="two-column-grid">
        <SectionCard
          title="Task management"
          description="Create, update, archive, and recover project work with smooth operational flows."
        >
          {!session ? (
            <StatusPanel title="Authentication required" tone="danger">
              Sign in on the Auth page to manage tasks.
            </StatusPanel>
          ) : (
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Project
                <select value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })}>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Task title
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as "backlog" | "in_progress" | "review" | "completed",
                    })
                  }
                >
                  <option value="backlog">Backlog</option>
                  <option value="in_progress">In progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label>
                Due date
                <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
              </label>
              <button className="primary-button" type="submit">
                {editingTaskId ? "Update task" : "Create task"}
              </button>
            </form>
          )}
        </SectionCard>

        <SectionCard
          title="Current tasks"
          description="Tasks are tied to projects so the platform shows real delivery flow."
        >
          <div className="table-like-list">
            {tasks.map((task) => (
              <div className="entity-card" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.projectName}</p>
                  <small>
                    {task.status} · due {new Date(task.dueDate).toLocaleDateString()}
                  </small>
                </div>
                <div className="entity-actions">
                  <button
                    className="inline-button"
                    type="button"
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setForm({
                        projectId: task.projectId,
                        title: task.title,
                        status: task.status as "backlog" | "in_progress" | "review" | "completed",
                        dueDate: task.dueDate.slice(0, 10),
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button className="inline-button inline-button-danger" type="button" onClick={() => handleArchive(task.id)}>
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Archived tasks"
        description="Archived task records can be restored without losing project linkage."
      >
        {archivedTasks.length === 0 ? (
          <p className="muted">No archived tasks yet.</p>
        ) : (
          <div className="table-like-list">
            {archivedTasks.map((task) => (
              <div className="entity-card archived" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.projectName}</p>
                  <small>Archived work item</small>
                </div>
                <div className="entity-actions">
                  <button className="inline-button inline-button-success" type="button" onClick={() => handleRestore(task.id)}>
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {message ? <StatusPanel title="Saved" tone="success">{message}</StatusPanel> : null}
      {error ? <StatusPanel title="Error" tone="danger">{error}</StatusPanel> : null}
    </div>
  );
}
