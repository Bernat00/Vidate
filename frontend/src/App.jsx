import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css'
import LandingPage from "./components/landingPage.jsx";
import Login from "./components/login.jsx";
import Register from "./components/register.jsx";

function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App