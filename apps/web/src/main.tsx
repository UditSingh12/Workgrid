import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { DashboardLayout } from "./shared/layouts/dashboard-layout";
import { AuthPage } from "./pages/auth-page";
import { ActivityPage } from "./pages/activity-page";
import { OverviewPage } from "./pages/overview-page";
import { WorkspacePage } from "./pages/workspace-page";
import { TeamPage } from "./pages/team-page";
import { ClientsPage } from "./pages/clients-page";
import { ProjectsPage } from "./pages/projects-page";
import { TasksPage } from "./pages/tasks-page";
import { BillingPage } from "./pages/billing-page";
import { SessionProvider } from "./shared/session";
import "./styles.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "workspace", element: <WorkspacePage /> },
      { path: "team", element: <TeamPage /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "billing", element: <BillingPage /> },
      { path: "activity", element: <ActivityPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  </React.StrictMode>,
);
