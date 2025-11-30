// frontend/src/pages/Demo/TOTP.tsx
import { useState } from "react";
import { postJson } from "../../services/api";
import { useToast } from "../../components/ToastContext";
import { QRCodeSVG } from "qrcode.react";

export default function TOTPPage() {
    const [uri, setUri] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const toast = useToast();

    async function setup() {
        try {
            const res = await postJson("/totp/setup/") as { uri?: string; secret?: string } | null;
            if (res?.uri) {
                setUri(res.uri);
                setSecret(res.secret ?? null);
                toast.push("TOTP setup ready", "success");
            } else {
                toast.push("Unexpected response", "error");
            }
        } catch (err: unknown) {
            toast.push("TOTP setup failed: " + JSON.stringify((err as any)?.body ?? err), "error");
        }
    }

    async function verify() {
        try {
            const res = await postJson("/totp/verify/", { code }) as { detail?: string } | null;
            if (res?.detail === "totp_ok") {
                setMessage("Verified successfully");
                toast.push("TOTP verified", "success");
            } else {
                setMessage("Invalid code");
                toast.push("TOTP verify failed", "error");
            }
        } catch (err: unknown) {
            toast.push("Verify failed: " + JSON.stringify((err as any)?.body ?? err), "error");
        }
    }

    return (
        <div className="mt-4 form-card">
            <div className="flex gap-2">
                <button onClick={setup} className="btn-primary">Setup</button>
            </div>

            {uri && (
                <div className="mt-3">
                    <div className="mb-2">Scan QR with an authenticator app:</div>
                    <div className="bg-white p-3 inline-block"><QRCodeSVG value={uri} /></div>
                    <div className="mt-2 text-sm text-gray-600">Secret: <code className="break-all">{secret}</code></div>

                    <div className="mt-3">
                        <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter code from app" className="w-full border rounded p-2" />
                        <div className="mt-2">
                            <button onClick={verify} className="btn-primary">Verify</button>
                        </div>
                        {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
