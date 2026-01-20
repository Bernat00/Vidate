import type { ReactElement } from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import LandingPage from "./components/landing/landingPage";
import Login from "./components/login/login";
import Register from "./components/register/register";
import MyMatches from "./components/my-matches/myMatches";
import { ToastProvider } from './context/toastContext';

import SetupProfile from "./components/setup-profile/setupProfile";
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
