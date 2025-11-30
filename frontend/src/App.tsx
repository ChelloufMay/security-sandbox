// frontend/src/App.tsx
import { Routes, Route, useParams } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Features from "./pages/Features";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import RegisterVerify from "./components/Auth/RegisterVerify";
import FeaturePage from "./pages/FeaturePage";

import VaultDetail from "./components/Vault/VaultDetail"; // adjust import path if needed
import VaultList from "./components/Vault/VaultList";

function VaultDetailWrapper() {
    const { id } = useParams<{ id: string }>();
    return <VaultDetail vaultId={id ?? ""} />;
}

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
                    <Route path="/vaults" element={<VaultList />} />
                    <Route path="/vaults/:id" element={<VaultDetailWrapper />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/feature/:featureKey" element={<FeaturePage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}
