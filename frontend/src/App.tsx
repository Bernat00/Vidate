import type { ReactElement } from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import LandingPage from "./pages/landingPage.tsx";
import Login from "./pages/login.tsx";
import Register from "./pages/register.tsx";
import MyMatches from "./pages/myMatches.tsx";
import { ToastProvider } from './context/toastContext';

import SetupProfile from "./pages/setupProfile.tsx";
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicOnlyRoute from './components/routing/PublicOnlyRoute';
import ProtectedLayout from './components/layout/ProtectedLayout';
import Home from './pages/home';
import Profile from './pages/profile';

function App(): ReactElement {
  return (
    <BrowserRouter>
        <ToastProvider>
            <AuthProvider>
                <Routes>
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
                    {/* Protected area with shared navbar layout */}
                    <Route element={
                      <ProtectedRoute>
                        <ProtectedLayout />
                      </ProtectedRoute>
                    }>
                      <Route path="/home" element={<Home />} />
                      <Route path="/setup-profile" element={<SetupProfile />} />
                      <Route path="/my-matches" element={<MyMatches />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </ToastProvider>
    </BrowserRouter>
  )
}

export default App
