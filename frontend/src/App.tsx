// frontend/src/App.tsx
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Features from "./pages/Features";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import RegisterVerify from "./components/Auth/RegisterVerify";
import FeaturePage from "./pages/FeaturePage";

export default function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/register/verify" element={<RegisterVerify />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/feature/:featureKey" element={<FeaturePage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}
