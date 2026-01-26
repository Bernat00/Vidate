import type { ReactElement } from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import LandingPage from "./pages/landingPage.tsx";
import Login from "./pages/login.tsx";
import Register from "./pages/register.tsx";
import MyMatches from "./pages/myMatches.tsx";
import { ToastProvider } from './context/toastContext';

import SetupProfile from "./pages/setupProfile.tsx";
import SetupPreferences from "./pages/setupPreferences.tsx";
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicOnlyRoute from './components/routing/PublicOnlyRoute';

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
                    <Route path="/setup-profile" element={
                      <ProtectedRoute>
                        <SetupProfile />
                      </ProtectedRoute>
                    } />
                    <Route path="/setup-preferences" element={
                      <ProtectedRoute>
                        <SetupPreferences />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-matches" element={
                      <ProtectedRoute>
                        <MyMatches />
                      </ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </ToastProvider>
    </BrowserRouter>
  )
}

export default App
