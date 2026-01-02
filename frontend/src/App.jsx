import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import LandingPage from "./components/landing/landingPage.jsx";
import Login from "./components/login/login.jsx";
import Register from "./components/register/register.jsx";
import MyMatches from "./components/my-matches/myMatches.jsx";
import { ToastProvider } from './context/toastcontext';

import SetupProfile from "./components/setup-profile/setupProfile.jsx";

function App() {
  return (
    <BrowserRouter>
        <ToastProvider>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/my-matches" element={<MyMatches />} />
                <Route path="/setup-profile" element={<SetupProfile />} />
            </Routes>
        </ToastProvider>
    </BrowserRouter>
  )
}

export default App