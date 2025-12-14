// frontend/src/pages/Home.tsx
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="container py-12">
            <div className="hero mx-auto max-w-3xl">
                <h1>Security Sandbox</h1>
                <p>
                    Environnement de test local interactif présentant des fonctionnalités de sécurité courantes:
                    email verification, TOTP, symmetric/asymmetric crypto, vaults and RBAC.
                    Utilisez ces démonstrations pour découvrir comment ces fonctionnalités fonctionnent de bout en bout.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-4">
                    <Link to="/register" className="btn-primary">Sign up</Link>
                    <Link to="/login" className="btn-outline">Log in</Link>
                </div>

                <div className="mt-6 text-sm text-gray-600">
                    <strong>Tip:</strong>  Les adresses e-mail sont capturées par MailHog (http://localhost:8025). Commencez par créer un compte.
                </div>
            </div>
        </div>
    );
}
