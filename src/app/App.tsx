import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { SentimentDataProvider } from './context/SentimentDataContext';
import { ScoringConfigProvider } from './context/ScoringConfigContext';
import { TaskWorkflowProvider } from './context/TaskWorkflowContext';

export default function App() {
  return (
    <ScoringConfigProvider>
      <SentimentDataProvider>
        <TaskWorkflowProvider>
          <>
            <RouterProvider router={router} />
            <Toaster />
          </>
        </TaskWorkflowProvider>
      </SentimentDataProvider>
    </ScoringConfigProvider>
  );
}
