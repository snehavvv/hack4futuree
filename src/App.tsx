import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { GrandLoadingScreen } from './components/GrandLoadingScreen';
import ConstellationCanvas from './components/ConstellationCanvas';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, user } = useAuth();
  const location = useLocation();
  
  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  
  return <>{children}</>;
};

import { CustomCursor } from './components/CustomCursor';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Global patch for SVG path "undefined" error
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'd') {
          const target = mutation.target as SVGPathElement;
          if (target.getAttribute('d') === 'undefined') {
            target.setAttribute('d', 'M 0 0');
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['d']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <CustomCursor />
        {isInitializing ? (
          <GrandLoadingScreen onComplete={() => setIsInitializing(false)} />
        ) : (
          <>
            <ConstellationCanvas />
            <Routes>
          {/* Landing page (No Layout) */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth pages (No Layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Dashboard pages (With Layout) */}
          <Route element={<Layout />}>
             <Route path="/dashboard" element={
               <ProtectedRoute>
                 <DashboardPage />
               </ProtectedRoute>
             } />
            <Route path="/upload" element={
              <ProtectedRoute>
                 <UploadPage />
              </ProtectedRoute>
             } />
             <Route path="/results/:id" element={
               <ProtectedRoute>
                 <ResultsPage />
               </ProtectedRoute>
             } />
             <Route path="/history" element={
               <ProtectedRoute>
                 <HistoryPage />
               </ProtectedRoute>
             } />
             <Route path="/settings" element={
               <ProtectedRoute>
                 <SettingsPage />
               </ProtectedRoute>
             } />
           </Route>
           
           {/* Fallback */}
           <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
         </>
        )}
       </ToastProvider>
     </AuthProvider>
   );
}

export default App;
