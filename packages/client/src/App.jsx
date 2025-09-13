import { Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import CoursesPage from './features/courses/CoursesPage.jsx';
import CourseDetail from './features/courses/CourseDetail.jsx';
import RecommendPage from './features/recommend/RecommendPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import useAuth from './hooks/useAuth.js';

function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-4 py-3 flex gap-4 items-center">
        <Link className="font-semibold" to="/">GLA Dashboard</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/recommend">Recommend</Link>
        <div className="flex-1" />
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button className="text-sm text-blue-600" onClick={logout}>Logout</button>
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <main className="p-4 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Navigate to="/dashboard" /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
      <Route path="/dashboard" element={<Layout><ProtectedRoute><DashboardPage /></ProtectedRoute></Layout>} />
      <Route path="/courses" element={<Layout><ProtectedRoute><CoursesPage /></ProtectedRoute></Layout>} />
      <Route path="/courses/:id" element={<Layout><ProtectedRoute><CourseDetail /></ProtectedRoute></Layout>} />
      <Route path="/recommend" element={<Layout><ProtectedRoute><RecommendPage /></ProtectedRoute></Layout>} />
      <Route path="*" element={<Layout>Not Found</Layout>} />
    </Routes>
  );
}

