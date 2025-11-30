// frontend/src/components/interactive/HashInfoInteractive.tsx
import { useState } from "react";
import { postJson } from "../../services/api";
import { useToast } from "../ToastContext";

export default function HashInfoInteractive() {
    const [password, setPassword] = useState("");
    const [result, setResult] = useState<{ hash?: string; time_ms?: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    async function compute() {
        if (!password) return toast.push("Enter password", "error");
        setLoading(true);
        setResult(null);
        try {
            const res = (await postJson("/password/hash-info/", { password })) as { hash?: string; time_ms?: number };
            setResult(res);
            toast.push("Hash computed", "success");
        } catch (e) {
            console.error(e);
            toast.push("Compute failed", "error");
        } finally { setLoading(false); }
    }

    return (
        <div className="form-card">
            <h3 className="font-semibold">Password hash (Argon2) info</h3>
            <p className="text-sm text-gray-600">Send a password to the backend to compute an Argon2 hash and measure time.</p>

            <div className="mt-3">
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="border rounded p-2 w-full" />
                <div className="mt-2 flex gap-2">
                    <button onClick={compute} className="btn-primary" disabled={loading}>{loading ? "Hashing..." : "Hash"}</button>
                </div>
            </div>

            {result && (
                <div className="mt-3 bg-white p-3 border rounded text-sm">
                    <div><strong>Time (ms):</strong> {result.time_ms}</div>
                    <div className="mt-2"><strong>Hash:</strong><pre className="whitespace-pre-wrap break-words">{result.hash}</pre></div>
                </div>
            )}
        </div>
    );
}
