// frontend/src/pages/Home.tsx
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="container py-12">
            <div className="hero mx-auto max-w-3xl">
                <h1>Security Sandbox</h1>
                <p>
                    Interactive local sandbox demonstrating common security features:
                    email verification, TOTP, symmetric/asymmetric crypto, vaults and RBAC.
                    Use these demos to learn how these features work end-to-end.
                </p>

                <div className="mt-6 flex justify-center gap-4">
                    <Link to="/register" className="btn-primary">Sign up</Link>
                    <Link to="/login" className="btn-outline">Log in</Link>
                </div>

                <div className="mt-6 text-sm text-gray-600">
                    Tip: Emails are captured by MailHog (http://localhost:8025). Start by creating an account.
                </div>
            </div>
        </div>
    );
}
