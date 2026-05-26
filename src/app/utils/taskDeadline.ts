export function isTaskDeadlineWarning(deadline: string | undefined, completed: boolean) {
  if (completed || !deadline) {
    return false;
  }

  const dueAt = new Date(deadline.replace(' ', 'T')).getTime();

  if (Number.isNaN(dueAt)) {
    return false;
  }

  const remaining = dueAt - Date.now();
  return remaining > 0 && remaining <= 24 * 60 * 60 * 1000;
}

export function getDeadlineClassName(deadline: string | undefined, completed: boolean) {
  return isTaskDeadlineWarning(deadline, completed)
    ? 'font-semibold text-red-600'
    : 'text-gray-600';
}
