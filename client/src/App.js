// src/App.js
import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { TaskProvider } from './contexts/TaskContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingSpinner, TabButton, ErrorBoundary } from './components/shared';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';
import CalendarView from './components/CalendarView';
import Dashboard from './components/Dashboard';
import DataManagement from './components/DataManagement';
import config from './config';

// רכיב מוגן שדורש אימות
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// תוכן ראשי של האפליקציה
const MainContent = () => {
  const [activeView, setActiveView] = React.useState('list');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{config.APP_NAME}</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{currentUser?.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              התנתק
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <nav className="flex space-x-4 mb-6">
          <TabButton
            active={activeView === 'list'}
            onClick={() => setActiveView('list')}
          >
            רשימה
          </TabButton>
          <TabButton
            active={activeView === 'calendar'}
            onClick={() => setActiveView('calendar')}
          >
            לוח שנה
          </TabButton>
          <TabButton
            active={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
          >
            סטטיסטיקות
          </TabButton>
        </nav>

        <TabButton
          active={activeView === 'data'}
          onClick={() => setActiveView('data')}
        >
          ניהול נתונים
        </TabButton>

        {/* ... */}

        {activeView === 'data' &&
          <DataManagement />}

        <ErrorBoundary>
          {activeView === 'list' && (
            <>
              <AddTask />
              <TaskList />
            </>
          )}
          {activeView === 'calendar' && <CalendarView />}
          {activeView === 'dashboard' && <Dashboard />}
        </ErrorBoundary>
      </main>
    </>
  );
};

// הרכיב הראשי של האפליקציה
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TaskProvider>
          <div className="min-h-screen bg-gray-50" dir="rtl">
            <Routes>
              <Route
                path="/login"
                element={
                  <Login
                    appName={config.APP_NAME}
                    version={config.VERSION}
                  />
                }
              />
              <Route
                path="/register"
                element={
                  <Register
                    appName={config.APP_NAME}
                    version={config.VERSION}
                  />
                }
              />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainContent />
                  </ProtectedRoute>
                }
              />
              {/* נתיבים נוספים במידת הצורך */}
            </Routes>
          </div>
        </TaskProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;