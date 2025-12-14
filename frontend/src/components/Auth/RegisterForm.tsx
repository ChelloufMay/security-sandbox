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

    // Field errors state
    const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string; password2?: string; general?: string }>({});

    const navigate = useNavigate();
    const toast = useToast();

    function validate(): boolean {
        const newErrors: typeof errors = {};
        let valid = true;

        if (!username.trim()) { newErrors.username = "Username is required"; valid = false; }

        if (!email.trim()) { newErrors.email = "Email is required"; valid = false; }
        else if (!/\S+@\S+\.com$/.test(email)) {
            newErrors.email = "Email must contain '@' and end with '.com'";
            valid = false;
        }

        if (!password) { newErrors.password = "Password is required"; valid = false; }
        else {
            if (password.length < 8) { newErrors.password = "Password must be at least 8 characters"; valid = false; }
            else if (!/[0-9]/.test(password)) { newErrors.password = "Password must have at least one number"; valid = false; }
            else if (!/[A-Z]/.test(password)) { newErrors.password = "Password must have at least one uppercase letter"; valid = false; }
            else if (!/[^A-Za-z0-9]/.test(password)) { newErrors.password = "Password must have at least one symbol"; valid = false; }
        }

        if (!password2) { newErrors.password2 = "Please verify your password"; valid = false; }
        else if (password !== password2) { newErrors.password2 = "Passwords do not match"; valid = false; }

        setErrors(newErrors);
        return valid;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});

        if (!validate()) {
            return;
        }

        setSubmitting(true);
        try {
            const res = (await postJson("/register/", { username, email, password })) as RegisterResp;
            if (res?.detail === "verification_sent") {
                toast.push("Verification sent. Open MailHog to view code.", "success");
                navigate(`/register/verify?username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`);
            } else if (res?.error === "username_taken") {
                setErrors({ ...errors, username: "Username is already taken" });
            } else {
                setErrors({ ...errors, general: "Unexpected server response" });
            }
        } catch (err) {
            const body = getBody(err);
            setErrors({ ...errors, general: `Register failed: ${JSON.stringify(body)}` });
        } finally {
            setSubmitting(false);
        }
    }

    // specific cherry red style as requested
    const errorStyle = { color: '#D2042D', fontSize: '0.875rem', marginTop: '0.25rem' };

    return (
        <div className="container py-10">
            <div className="mx-auto max-w-md form-card">
                <h2 className="text-xl font-semibold text-primary-700">Register</h2>
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <div>
                        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded p-2" />
                        {errors.username && <div style={errorStyle}>{errors.username}</div>}
                    </div>

                    <div>
                        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded p-2" />
                        {errors.email && <div style={errorStyle}>{errors.email}</div>}
                    </div>

                    <div>
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded p-2" />
                        {errors.password && <div style={errorStyle}>{errors.password}</div>}
                    </div>

                    <div>
                        <input type="password" placeholder="Verify Password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="w-full border rounded p-2" />
                        {errors.password2 && <div style={errorStyle}>{errors.password2}</div>}
                    </div>

                    {errors.general && <div style={errorStyle} className="mb-2">{errors.general}</div>}

                    <div className="flex justify-between gap-3 pt-2">
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Registering..." : "Register"}</button>
                        <button type="button" onClick={() => navigate("/")} className="btn-outline">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
