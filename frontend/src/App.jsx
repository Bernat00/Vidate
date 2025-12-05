import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import LandingPage from "./components/landingPage.jsx";
import Login from "./components/login.jsx";
import Register from "./components/register.jsx";

import {logout} from "./heplers.js";

function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path={"/logout"} action={logout} element={<LandingPage />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App