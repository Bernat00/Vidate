import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import LandingPage from "./components/landing/landingPage.jsx";
import Login from "./components/login/login.jsx";
import Register from "./components/register/register.jsx";
import MyMatches from "./components/my-matches/myMatches.jsx";
import { ToastProvider } from './context/toastcontext';

import SetupProfile from "./components/setup-profile/setupProfile.jsx";
// NEW auth context and route guards
import { AuthProvider } from './context/authContext.jsx';
import ProtectedRoute from './components/routing/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/routing/PublicOnlyRoute.jsx';

function App() {
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