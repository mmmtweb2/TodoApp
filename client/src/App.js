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
import { useTasks } from './contexts/TaskContext';

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

// רכיב תצוגת משימות
const TasksView = ({ view }) => {
  const { tasks, sharedTasks } = useTasks();
  const [showSharedTasks, setShowSharedTasks] = React.useState(false);

  if (view !== 'list') {
    return null;
  }

  return (
    <>
      <div className="mb-6">
        <AddTask />
        <div className="flex justify-between items-center mt-4 mb-2">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowSharedTasks(false)}
              className={`px-3 py-1 rounded-md ${!showSharedTasks
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              המשימות שלי ({tasks.length})
            </button>
            <button
              onClick={() => setShowSharedTasks(true)}
              className={`px-3 py-1 rounded-md ${showSharedTasks
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              משימות משותפות ({sharedTasks.length})
            </button>
          </div>
        </div>
        <TaskList tasks={showSharedTasks ? sharedTasks : tasks} isShared={showSharedTasks} />
      </div>
    </>
  );
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
          <h1 className="text-2xl font-bold text-gray-900">ניהול משימות</h1>
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

        <ErrorBoundary>
          <TasksView view={activeView} />
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainContent />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </TaskProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;