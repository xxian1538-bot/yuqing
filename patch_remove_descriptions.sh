#!/bin/bash
sed -i '' -e '/<p className="text-gray-600">.*<\/p>/d' \
  src/app/components/settings/ApiConfig.tsx \
  src/app/components/settings/SystemConfig.tsx \
  src/app/components/settings/UserManagement.tsx \
  src/app/components/settings/NotificationConfig.tsx \
  src/app/components/disposal/DisposalTasks.tsx \
  src/app/components/disposal/AlertRules.tsx \
  src/app/components/disposal/DisposalStatistics.tsx \
  src/app/components/comment/PerformanceManagement.tsx \
  src/app/components/comment/CommentTaskList.tsx \
  src/app/components/comment/CommentStatistics.tsx \
  src/app/components/analytics/SentimentStatistics.tsx
