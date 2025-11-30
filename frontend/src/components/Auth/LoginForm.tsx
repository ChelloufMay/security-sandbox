import React, { useState } from "react";
import { postJson } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../ToastContext.ts";

function getBody(err: unknown) { return (err as { body?: unknown } | undefined)?.body ?? err; }

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = (await postJson("/login/", { username, password })) as { detail?: string; error?: string };
            if (res?.detail === "logged_in") {
                toast.push("Logged in", "success");
                navigate("/features");
            } else {
                toast.push("Login failed", "error");
            }
        } catch (err) {
            toast.push(`Login failed: ${JSON.stringify(getBody(err))}`, "error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="container py-10">
            <div className="mx-auto max-w-md form-card">
                <h2 className="text-xl font-semibold text-primary-700">Log in</h2>
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <input required placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full border rounded p-2" />
                    <input required type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded p-2" />
                    <div className="flex items-center justify-between">
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Logging in..." : "Login"}</button>
                        <Link to="/register" className="text-sm text-primary-700">Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
