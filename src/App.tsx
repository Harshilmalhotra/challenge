import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Achievements from './pages/Achievements';
import Learning from './pages/Learning';
import Profile from './pages/Profile';
import Gamify from './pages/Gamify';
import Pose from './pages/Pose';
import AuthModal from './components/auth/AuthModal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Rp from './pages/Rp';
import { useAuth } from './hooks/useAuth';
import { UserProvider } from './context/UserContext';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import LoadingSpinner from './components/ui/LoadingSpinner';

function AppContent() {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              LearnPulse
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your Dopamine-Driven Learning Dashboard
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span>Track your learning progress</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span>Earn achievements and badges</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Maintain learning streaks</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Compete with others</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Get Started
          </button>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  return (
    <UserProvider>
      <ProgressProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="achievements" element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              } />
              <Route path="learning" element={
                <ProtectedRoute>
                  <Learning />
                </ProtectedRoute>
              } />
              <Route path="gamify" element={
                <ProtectedRoute>
                  <Gamify />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="pose" element={
               
                  <Pose />
                
              } />

              <Route path="rp" element={
                
                <Rp />
              } />
              <Route path="*" element={<div className="p-8">Page Not Found</div>} />
            </Route>
          </Routes>
        </Router>
      </ProgressProvider>
    </UserProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;