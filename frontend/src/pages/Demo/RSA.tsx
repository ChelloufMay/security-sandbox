import { useState } from "react";
import { postJson } from "../../services/api";
import { useToast } from "../../components/ToastContext";

type RSAKeys = { private_key: string; public_key: string };

function safeStringify(value: unknown): string {
    try {
        if (value instanceof Error) return value.message;
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

export default function RSA() {
    const [keys, setKeys] = useState<RSAKeys | null>(null);
    const [message, setMessage] = useState<string>("sign this");
    const [signature, setSignature] = useState<string | null>(null);
    const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useToast();

    async function gen() {
        setLoading(true);
        try {
            const res = await postJson("/demo/rsa/generate/", {});
            if (res && typeof res === "object" && "private_key" in res && "public_key" in res) {
                setKeys(res as RSAKeys);
                setSignature(null);
                setVerifyResult(null);
                toast.push("Keys generated", "success");
            } else {
                toast.push("Unexpected keygen response", "error");
            }
        } catch (err: unknown) {
            console.error("gen error:", safeStringify(err));
            toast.push("Key generation failed: " + safeStringify(err), "error");
        } finally {
            setLoading(false);
        }
    }

    async function sign() {
        if (!keys) { toast.push("Generate keys first", "error"); return; }
        setLoading(true);
        try {
            const res = await postJson("/demo/rsa/sign/", { private_key: keys.private_key, message });
            if (res && typeof res === "object" && "signature" in res) {
                setSignature((res as { signature: string }).signature);
                setVerifyResult(null);
                toast.push("Message signed", "success");
            } else {
                toast.push("Unexpected sign response", "error");
            }
        } catch (err: unknown) {
            console.error("sign error:", safeStringify(err));
            toast.push("Sign failed: " + safeStringify(err), "error");
        } finally {
            setLoading(false);
        }
    }

    async function verify() {
        if (!keys || !signature) { toast.push("Missing keys or signature", "error"); return; }
        setLoading(true);
        try {
            const res = await postJson("/demo/rsa/verify/", { public_key: keys.public_key, message, signature });
            if (res && typeof res === "object" && "valid" in res) {
                setVerifyResult(Boolean((res as { valid: unknown }).valid));
                toast.push("Verify complete", "success");
            } else {
                toast.push("Unexpected verify response", "error");
            }
        } catch (err: unknown) {
            console.error("verify error:", safeStringify(err));
            toast.push("Verify failed: " + safeStringify(err), "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-4 form-card">
            <div className="flex gap-2">
                <button onClick={gen} className="btn-primary" disabled={loading}>Generate keys</button>
                <button onClick={sign} className="btn-outline" disabled={!keys || loading}>Sign</button>
                <button onClick={verify} className="btn-outline" disabled={!signature || loading}>Verify</button>
            </div>

            <textarea className="w-full border rounded mt-3 p-2" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />

            {keys && (
                <div className="mt-3 bg-white p-3 border rounded space-y-2 text-xs">
                    <div><strong>Public Key:</strong><pre className="whitespace-pre-wrap">{keys.public_key}</pre></div>
                    <div><strong>Private Key:</strong><pre className="whitespace-pre-wrap">{keys.private_key}</pre></div>
                </div>
            )}

            {signature && <div className="mt-3 p-2 bg-white border rounded text-sm"><strong>Signature:</strong> <code className="break-all">{signature}</code></div>}
            {verifyResult !== null && <div className={"mt-3 p-2 rounded " + (verifyResult ? "bg-green-50" : "bg-red-50")}>Valid: {verifyResult ? "true" : "false"}</div>}
        </div>
    );
}
