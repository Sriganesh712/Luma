import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Eagerly loaded (always needed on first paint)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardRedirect from './pages/DashboardRedirect';

// Lazy-loaded role chunks
const AdminDashboard    = lazy(() => import('./pages/admin/Dashboard'));
const AdminClasses      = lazy(() => import('./pages/admin/Classes'));
const ClassForm         = lazy(() => import('./pages/admin/ClassForm'));
const AdminClassDetail  = lazy(() => import('./pages/admin/ClassDetail'));
const AdminUsers        = lazy(() => import('./pages/admin/Users'));

const TeacherDashboard  = lazy(() => import('./pages/teacher/Dashboard'));
const TeacherClassDetail= lazy(() => import('./pages/teacher/ClassDetail'));
const TeacherMaterials  = lazy(() => import('./pages/teacher/Materials'));
const TeacherAssignments= lazy(() => import('./pages/teacher/Assignments'));
const MaterialUpload    = lazy(() => import('./pages/teacher/MaterialUpload'));
const AssignmentForm    = lazy(() => import('./pages/teacher/AssignmentForm'));
const AssignmentDetail  = lazy(() => import('./pages/teacher/AssignmentDetail'));

const StudentDashboard  = lazy(() => import('./pages/student/Dashboard'));
const StudentClassDetail= lazy(() => import('./pages/student/ClassDetail'));
const StudentGrades     = lazy(() => import('./pages/student/Grades'));
const AssignmentTake    = lazy(() => import('./pages/student/AssignmentTake'));

// @ts-ignore – App is a JS component without type declarations
const ChatPage          = lazy(() => import('./App'));

import './index.css';

const PageLoader = () => (
  <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={pageTransition.initial}
        animate={pageTransition.animate}
        exit={pageTransition.exit}
        transition={pageTransition.transition}
        className="min-h-screen"
      >
        <Routes location={location}>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Smart dashboard redirect after login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin"                       element={<AdminDashboard />} />
            <Route path="/admin/classes"               element={<AdminClasses />} />
            <Route path="/admin/classes/new"           element={<ClassForm />} />
            <Route path="/admin/classes/:id"           element={<AdminClassDetail />} />
            <Route path="/admin/teachers"              element={<AdminUsers />} />
            <Route path="/admin/students"              element={<AdminUsers />} />
            <Route path="/admin/settings"              element={<AdminDashboard />} />
          </Route>

          {/* Teacher routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher"                            element={<TeacherDashboard />} />
            <Route path="/teacher/classes"                    element={<TeacherDashboard />} />
            <Route path="/teacher/classes/:id"                element={<TeacherClassDetail />} />
            <Route path="/teacher/materials"                  element={<TeacherMaterials />} />
            <Route path="/teacher/materials/upload"           element={<MaterialUpload />} />
            <Route path="/teacher/assignments"                element={<TeacherAssignments />} />
            <Route path="/teacher/assignments/new"            element={<AssignmentForm />} />
            <Route path="/teacher/assignments/:id"            element={<AssignmentDetail />} />
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student"                    element={<StudentDashboard />} />
            <Route path="/student/classes"            element={<StudentDashboard />} />
            <Route path="/student/classes/:id"        element={<StudentClassDetail />} />
            <Route path="/student/grades"             element={<StudentGrades />} />
            <Route path="/student/assignments"        element={<StudentDashboard />} />
            <Route path="/student/assignments/:id"    element={<AssignmentTake />} />
            <Route path="/student/chat"               element={<ChatPage />} />
          </Route>

          {/* Default: redirect to dashboard */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            }}
          />
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
