import { Link } from "react-router-dom";
import { postJson } from "../services/api";

export default function Header() {
    async function handleLogout() {
        try {
            await postJson("/logout/");
        } catch (e) {
            console.error(e);
        } finally {
            window.location.href = "/";
        }
    }

    return (
        <header className="app-header">
            <div className="container flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3 no-underline">
                        <div className="app-logo">SS</div>
                        <div className="hidden sm:block">
                            <div className="text-sm font-semibold text-primary-700">Security Sandbox</div>
                            <div className="text-xs text-gray-500">Local security demos</div>
                        </div>
                    </Link>
                </div>

                <div>
                    <button onClick={handleLogout} className="btn-outline">Logout</button>
                </div>
            </div>
        </header>
    );
}
