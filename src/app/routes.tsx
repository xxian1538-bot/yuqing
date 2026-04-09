import { createBrowserRouter, redirect, Outlet } from "react-router";
import { Layout } from './components/Layout';
import { SentimentList } from './components/SentimentList';
import { SentimentDetail } from './components/SentimentDetail';

// Disposal (处置) components
import { DisposalTasks } from './components/disposal/DisposalTasks';
import { AlertRules } from './components/disposal/AlertRules';
import { DisposalStatistics } from './components/disposal/DisposalStatistics';

// Comment (网评) components
import { CommentTaskList } from './components/comment/CommentTaskList';
import { PerformanceManagement } from './components/comment/PerformanceManagement';
import { CommentStatistics } from './components/comment/CommentStatistics';

// Analytics (统计) components
import { SentimentStatistics } from './components/analytics/SentimentStatistics';

// Settings (设置) components
import { SystemConfig } from './components/settings/SystemConfig';
import { UserManagement } from './components/settings/UserManagement';
import { ApiConfig } from './components/settings/ApiConfig';
import { NotificationConfig } from './components/settings/NotificationConfig';

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
          {
            path: "statistics",
            Component: CommentStatistics,
          },
        ],
      },
      // Analytics routes
      {
        path: "analytics",
        Component: PassThrough,
        children: [
          {
            index: true,
            loader: () => redirect("sentiment"),
          },
          {
            path: "sentiment",
            Component: SentimentStatistics,
          },
          {
            path: "disposal",
            Component: DisposalStatistics,
          },
          {
            path: "comment",
            Component: CommentStatistics,
          },
        ],
      },
      // Settings routes
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
