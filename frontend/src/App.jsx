import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import LandingPage from "./components/landingPage.jsx";
import Login from "./components/login.jsx";
import Register from "./components/register.jsx";
import MyMatches from "./components/my-matches/myMatches.jsx";
import { ToastProvider } from './context/toastcontext';

import {logout} from "./heplers.js";

function App() {
  return (
    <BrowserRouter>
        <ToastProvider>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/my-matches" element={<MyMatches />} />
            </Routes>
        </ToastProvider>
    </BrowserRouter>
  )
}

export default App