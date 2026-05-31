import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import OnboardingGate from '@/components/onboarding/OnboardingGate';
import FoodPreview from '@/pages/FoodPreview';
import ExerciseSelector from '@/pages/ExerciseSelector';
import Friends from '@/pages/Friends';
import { TabStateProvider } from '@/components/mobile/TabStateManager';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const RouteContent = ({ children }) => {
  return <>{children}</>;
};

const AuthenticatedApp = () => {
  // OnboardingGate is the single state machine: handles loading, auth, onboarding, and app
  return (
    <OnboardingGate>
      <Routes>
          <Route path="/" element={
            <RouteContent pageKey="/">
              <LayoutWrapper currentPageName={mainPageKey}>
                <MainPage />
              </LayoutWrapper>
            </RouteContent>
          } />
          {Object.entries(Pages).map(([path, Page]) => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <RouteContent pageKey={path}>
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                </RouteContent>
              }
            />
          ))}
          <Route path="/ExerciseSelector" element={
            <RouteContent pageKey="/ExerciseSelector">
              <LayoutWrapper currentPageName="ExerciseSelector">
                <ExerciseSelector />
              </LayoutWrapper>
            </RouteContent>
          } />
          <Route path="/FoodPreview" element={
            <RouteContent pageKey="/FoodPreview">
              <LayoutWrapper currentPageName="FoodPreview">
                <FoodPreview />
              </LayoutWrapper>
            </RouteContent>
          } />
          <Route path="/Friends" element={
            <RouteContent pageKey="/Friends">
              <Friends />
            </RouteContent>
          } />
          <Route path="*" element={
            <RouteContent pageKey="404">
              <PageNotFound />
            </RouteContent>
          } />
        </Routes>
    </OnboardingGate>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <TabStateProvider>
            <AuthenticatedApp />
          </TabStateProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App