import { Navigate } from 'react-router';

export function RedirectToDisposalTasks() {
  return <Navigate to="/disposal/tasks" replace />;
}

export function RedirectToReportRecords() {
  return <Navigate to="/report/records" replace />;
}

export function RedirectToCommentTasksList() {
  return <Navigate to="/comment-tasks/list" replace />;
}

export function RedirectToAnalyticsSentiment() {
  return <Navigate to="/" replace />;
}

export function RedirectToSettingsSystem() {
  return <Navigate to="/settings/system" replace />;
}

export function RedirectToHome() {
  return <Navigate to="/" replace />;
}
