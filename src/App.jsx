import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import PropTypes from "prop-types";
import DashboardLayout from "./components/DashboardLayout";

// Auth Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CoursesPage from "./pages/CoursesPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentMaterials from "./pages/student/StudentMaterials";
import StudentClasses from "./pages/student/StudentClasses";
import StudentExams from "./pages/student/StudentExams";
import StudentResults from "./pages/student/StudentResults";

// Faculty Pages
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyCourses from "./pages/faculty/FacultyCourses";
import FacultyMaterials from "./pages/faculty/FacultyMaterials";
import FacultySchedule from "./pages/faculty/FacultySchedule";
import FacultyExams from "./pages/faculty/FacultyExams";
import FacultyResults from "./pages/faculty/FacultyResults";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminMaterials from "./pages/admin/AdminMaterials";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminLeaderboard from "./pages/admin/AdminLeaderboard";
import ProfilePage from "./pages/ProfilePage";

import Messages from "./pages/Messages";

// Protected Route HOC
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "faculty") return <Navigate to="/faculty" replace />;
    return <Navigate to="/student" replace />;
  }
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

// Wrapped with Layout
function WithLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

WithLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

// Routes configuration

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage type="student" />} />
      <Route path="/register/faculty" element={<RegisterPage type="faculty" />} />
      <Route path="/courses" element={<CoursesPage />} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><WithLayout><StudentDashboard /></WithLayout></ProtectedRoute>} />
      <Route path="/student/courses" element={<ProtectedRoute allowedRoles={["student"]}><WithLayout><StudentCourses /></WithLayout></ProtectedRoute>} />
      <Route path="/student/materials" element={<ProtectedRoute allowedRoles={["student"]}><WithLayout><StudentMaterials /></WithLayout></ProtectedRoute>} />
      <Route path="/student/classes" element={<ProtectedRoute allowedRoles={["student"]}><WithLayout><StudentClasses /></WithLayout></ProtectedRoute>} />
      <Route path="/student/exams" element={<ProtectedRoute allowedRoles={["student"]}><WithLayout><StudentExams /></WithLayout></ProtectedRoute>} />
      <Route path="/student/results" element={<ProtectedRoute allowedRoles={["student"]}><WithLayout><StudentResults /></WithLayout></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute><WithLayout><ProfilePage /></WithLayout></ProtectedRoute>} />
      <Route path="/student/messages" element={<ProtectedRoute><WithLayout><Messages /></WithLayout></ProtectedRoute>} />

      {/* Faculty Routes */}
      <Route path="/faculty" element={<ProtectedRoute allowedRoles={["faculty"]}><WithLayout><FacultyDashboard /></WithLayout></ProtectedRoute>} />
      <Route path="/faculty/courses" element={<ProtectedRoute allowedRoles={["faculty"]}><WithLayout><FacultyCourses /></WithLayout></ProtectedRoute>} />
      <Route path="/faculty/materials" element={<ProtectedRoute allowedRoles={["faculty"]}><WithLayout><FacultyMaterials /></WithLayout></ProtectedRoute>} />
      <Route path="/faculty/schedule" element={<ProtectedRoute allowedRoles={["faculty"]}><WithLayout><FacultySchedule /></WithLayout></ProtectedRoute>} />
      <Route path="/faculty/exams" element={<ProtectedRoute allowedRoles={["faculty"]}><WithLayout><FacultyExams /></WithLayout></ProtectedRoute>} />
      <Route path="/faculty/results" element={<ProtectedRoute allowedRoles={["faculty"]}><WithLayout><FacultyResults /></WithLayout></ProtectedRoute>} />
      <Route path="/faculty/profile" element={<ProtectedRoute><WithLayout><ProfilePage /></WithLayout></ProtectedRoute>} />
      <Route path="/faculty/messages" element={<ProtectedRoute><WithLayout><Messages /></WithLayout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><WithLayout><AdminDashboard /></WithLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><WithLayout><AdminUsers /></WithLayout></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={["admin"]}><WithLayout><AdminCourses /></WithLayout></ProtectedRoute>} />
      <Route path="/admin/materials" element={<ProtectedRoute allowedRoles={["admin"]}><WithLayout><AdminMaterials /></WithLayout></ProtectedRoute>} />
      <Route path="/admin/schedules" element={<ProtectedRoute allowedRoles={["admin"]}><WithLayout><AdminSchedules /></WithLayout></ProtectedRoute>} />
      <Route path="/admin/leaderboard" element={<ProtectedRoute allowedRoles={["admin"]}><WithLayout><AdminLeaderboard /></WithLayout></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute><WithLayout><ProfilePage /></WithLayout></ProtectedRoute>} />

      <Route path="/admin/messages" element={<ProtectedRoute><WithLayout><Messages /></WithLayout></ProtectedRoute>} />


      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import SmoothScroll from "./components/SmoothScroll";

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <AuthProvider>
          <SocketProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: { borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", fontSize: "14px", fontWeight: 500 },
                success: { iconTheme: { primary: "#2563eb", secondary: "white" } },
              }}
            />
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </SmoothScroll>
    </BrowserRouter>
  );
}
