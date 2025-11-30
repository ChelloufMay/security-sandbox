// frontend/src/components/interactive/CSRFDemo.tsx
import { useState } from "react";
import { postJson } from "../../services/api";
import { useToast } from "../ToastContext";

function printableErr(e: unknown) {
    if (e instanceof Error) return e.message;
    try { return JSON.stringify(e); } catch { return String(e); }
}

export default function CSRFDemo() {
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    async function sendTest() {
        setLoading(true);
        setResult(null);
        try {
            // harmless state-changing endpoint used to test CSRF behaviour
            const res = (await postJson("/password/hash-info/", { password: "csrf-test" })) as { hash?: string; time_ms?: number } | null;
            setResult(res ? `OK — got hash (len ${String(res.hash ?? "").length}), time_ms=${res.time_ms}` : "OK (no body)");
            toast.push("CSRF-protected request succeeded", "success");
        } catch (err: unknown) {
            // print safe representation
            const body = (err as { body?: unknown } | null)?.body ?? err;
            setResult(`Failed: ${printableErr(body)}`);
            toast.push("CSRF request failed", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-card">
            <h3 className="font-semibold">CSRF demo</h3>
            <p className="text-sm text-gray-600">
                This will POST to <code>/password/hash-info/</code> with X-CSRFToken (if cookie present).
            </p>

            <div className="mt-3 flex gap-2">
                <button onClick={sendTest} className="btn-primary" disabled={loading}>
                    {loading ? "Sending..." : "Send CSRF-protected"}
                </button>
            </div>

            {result && <div className="mt-3 p-2 bg-white border rounded text-sm">{result}</div>}
        </div>
    );
}
