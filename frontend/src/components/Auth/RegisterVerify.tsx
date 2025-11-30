import React, { useState } from "react";
import { postJson } from "../../services/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "../ToastContext.ts";

function getBody(err: unknown) {
    return (err as { body?: unknown } | undefined)?.body ?? err;
}

export default function RegisterVerify() {
    const [search] = useSearchParams();
    const username = search.get("username") ?? "";
    const email = search.get("email") ?? "";
    const [token, setToken] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        if (!username) { toast.push("Missing username parameter", "error"); return; }
        setSubmitting(true);
        try {
            const res = (await postJson("/verify-email/", { username, token })) as { detail?: string; error?: string };
            if (res?.detail === "verified") {
                toast.push("Email verified!", "success");
                navigate("/features");
            } else {
                toast.push(`Verify failed: ${JSON.stringify(res)}`, "error");
            }
        } catch (err) {
            toast.push(`Verify failed: ${JSON.stringify(getBody(err))}`, "error");
        } finally {
            setSubmitting(false);
        }
    }

    function handleResend() {
        toast.push("Resend not available: check MailHog (http://localhost:8025) for the original email.", "info");
    }

    return (
        <div className="container py-10">
            <div className="mx-auto max-w-md form-card">
                <h2 className="text-lg font-semibold text-primary-700">Verify your email</h2>
                <p className="text-sm text-gray-600">Enter the 6-digit code sent to <strong>{email || username}</strong>. (Open MailHog at <code>http://localhost:8025</code>.)</p>

                <form onSubmit={handleVerify} className="mt-4 space-y-3">
                    <input required placeholder="6-digit code" value={token} onChange={(e)=>setToken(e.target.value)} className="w-full border rounded p-2" />
                    <div className="flex gap-3">
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Verifying..." : "Verify"}</button>
                        <button type="button" onClick={handleResend} className="btn-outline">Resend</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
