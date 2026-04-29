import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { SentimentDataProvider } from './context/SentimentDataContext';
import { ScoringConfigProvider } from './context/ScoringConfigContext';

export default function App() {
  return (
    <ScoringConfigProvider>
      <SentimentDataProvider>
        <>
          <RouterProvider router={router} />
          <Toaster />
        </>
      </SentimentDataProvider>
    </ScoringConfigProvider>
  );
}
