import type { ReactElement } from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import LandingPage from "./pages/landingPage.tsx";
import Login from "./pages/login.tsx";
import Register from "./pages/register.tsx";
import MyMatches from "./pages/myMatches.tsx";
import MatchProfile from "./pages/matchProfile.tsx";
import { ToastProvider } from './context/toastContext';

import SetupProfile from "./pages/setupProfile.tsx";
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicOnlyRoute from './components/routing/PublicOnlyRoute';
import ProtectedLayout from './components/layout/ProtectedLayout';
import Home from './pages/home';
import Profile from './pages/profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import { WebSocketProvider } from './context/webSocketContext';
import MatchesLayout from './components/layout/MatchesLayout';
import { MatchesProvider } from './context/matchesContext';
import { NotificationListener } from './components/NotificationListener';

// ... existing imports
import ForgotPassword from "./pages/passwordResetEmail.tsx";
import ResetPassword from "./pages/resetPassword.tsx";

function App(): ReactElement {
  return (
    <BrowserRouter>
        <ToastProvider>
            <AuthProvider>
                <WebSocketProvider>
                    <MatchesProvider>
                        <NotificationListener />
                        <Routes>
                            {/* --- Public Routes --- */}
                            <Route path="/" element={
                              <PublicOnlyRoute>
                                <LandingPage />
                              </PublicOnlyRoute>
                            } />
                            <Route path="/login" element={
                              <PublicOnlyRoute>
                                <Login />
                              </PublicOnlyRoute>
                            } />
                            <Route path="/register" element={
                              <PublicOnlyRoute>
                                <Register />
                              </PublicOnlyRoute>
                            } />

                            {/* --- New Password Reset Routes --- */}
                            <Route path="/forgot-password" element={
                              <PublicOnlyRoute>
                                <ForgotPassword />
                              </PublicOnlyRoute>
                            } />
                            <Route path="/reset-password" element={
                              <PublicOnlyRoute>
                                <ResetPassword />
                              </PublicOnlyRoute>
                            } />

                            {/* --- Protected Routes --- */}
                            <Route path="/setup-profile" element={
                                <ProtectedRoute>
                                    <SetupProfile/>
                                </ProtectedRoute>
                            } />

                            <Route element={
                              <ProtectedRoute>
                                <ProtectedLayout />
                              </ProtectedRoute>
                            }>
                              <Route path="/home" element={<Home />} />
                              <Route path="/my-matches" element={<MatchesLayout />}>
                                <Route index element={<MyMatches />} />
                                <Route path="profile/:userId" element={<MatchProfile />} />
                              </Route>
                              <Route path="/profile" element={<Profile />} />
                            </Route>

                            <Route path="/admin" element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </MatchesProvider>
                </WebSocketProvider>
            </AuthProvider>
        </ToastProvider>
    </BrowserRouter>
  )
}

export default App;