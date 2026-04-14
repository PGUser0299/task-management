import React from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './screens/DashboardPage'
import { LoginPage } from './screens/LoginPage'
import { RegisterPage } from './screens/RegisterPage'
import { ProjectTasksPage } from './screens/ProjectTasksPage'
import { MembersPage } from './screens/MembersPage'
import { ProjectsListPage } from './screens/ProjectsListPage'
import { ProfilePage } from './screens/ProfilePage'
import { AppLayout } from './components/layout/AppLayout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAuth } from './state/auth'

const AuthenticatedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <AppLayout>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </AppLayout>
  )
}

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/projects/:projectId" element={<ProjectTasksPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
