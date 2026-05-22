import { createBrowserRouter, redirect, Outlet } from "react-router";
import { Layout } from './components/Layout';
import { SentimentList } from './components/SentimentList';
import { SentimentDetail } from './components/SentimentDetail';

// Disposal (处置) components
import { DisposalTasks } from './components/disposal/DisposalTasks';
import { AlertRules } from './components/disposal/AlertRules';

// Comment (网评) components
import { CommentTaskList } from './components/comment/CommentTaskList';
import { PerformanceManagement } from './components/comment/PerformanceManagement';

// Settings (设置) components
import { SystemConfig } from './components/settings/SystemConfig';
import { UserManagement } from './components/settings/UserManagement';
import { ApiConfig } from './components/settings/ApiConfig';
import { NotificationConfig } from './components/settings/NotificationConfig';
import { WorkflowConfigPage } from './components/audit/WorkflowConfigPage';
import { PendingReviewsPage } from './components/audit/PendingReviewsPage';
import { MyReviewRequestsPage } from './components/audit/MyReviewRequestsPage';

function PassThrough() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: SentimentList,
      },
      {
        path: "sentiment/:id",
        Component: SentimentDetail,
      },
      // Disposal routes
      {
        path: "disposal",
        Component: PassThrough,
        children: [
          {
            index: true,
            loader: () => redirect("tasks"),
          },
          {
            path: "tasks",
            Component: DisposalTasks,
          },
          {
            path: "rules",
            Component: AlertRules,
          },
        ],
      },
      // Comment tasks routes
      {
        path: "comment-tasks",
        Component: PassThrough,
        children: [
          {
            index: true,
            loader: () => redirect("list"),
          },
          {
            path: "list",
            Component: CommentTaskList,
          },
          {
            path: "performance",
            Component: PerformanceManagement,
          },
        ],
      },
      // Settings routes
      {
        path: "audit",
        Component: PassThrough,
        children: [
          {
            index: true,
            loader: () => redirect("pending"),
          },
          {
            path: "workflow",
            Component: WorkflowConfigPage,
          },
          {
            path: "pending",
            Component: PendingReviewsPage,
          },
          {
            path: "my-requests",
            Component: MyReviewRequestsPage,
          },
        ],
      },
      {
        path: "settings",
        Component: PassThrough,
        children: [
          {
            index: true,
            loader: () => redirect("system"),
          },
          {
            path: "system",
            Component: SystemConfig,
          },
        ],
      },
      {
        path: "*",
        loader: () => redirect("/"),
      },
    ],
  },
]);
