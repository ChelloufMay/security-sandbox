import React, { useState } from "react";
import { postJson } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ToastContext.ts";

type RegisterResp = { detail?: string; error?: string };

function getBody(err: unknown) {
    return (err as { body?: unknown } | undefined)?.body ?? err;
}

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== password2) {
            toast.push("Passwords do not match", "error");
            return;
        }
        setSubmitting(true);
        try {
            const res = (await postJson("/register/", { username, email, password })) as RegisterResp;
            if (res?.detail === "verification_sent") {
                toast.push("Verification sent. Open MailHog to view code.", "success");
                navigate(`/register/verify?username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`);
            } else {
                toast.push("Unexpected server response", "error");
            }
        } catch (err) {
            toast.push(`Register failed: ${JSON.stringify(getBody(err))}`, "error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="container py-10">
            <div className="mx-auto max-w-md form-card">
                <h2 className="text-xl font-semibold text-primary-700">Register</h2>
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <input required placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full border rounded p-2" />
                    <input required placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded p-2" />
                    <input required type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded p-2" />
                    <input required type="password" placeholder="Verify Password" value={password2} onChange={(e)=>setPassword2(e.target.value)} className="w-full border rounded p-2" />
                    <div className="flex gap-3">
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Registering..." : "Register"}</button>
                        <button type="button" onClick={()=>navigate("/")} className="btn-outline">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
