import { useState } from "react";
import { postJson } from "../../services/api";
import { useToast } from "../ToastContext";

function printable(v: unknown) {
    if (v instanceof Error) return v.message;
    try { return JSON.stringify(v); } catch { return String(v); }
}

export default function SMSInteractive() {
    const [phone, setPhone] = useState<string>("");
    const [tokenId, setTokenId] = useState<string | null>(null);
    const [token, setToken] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const toast = useToast();

    async function sendSMS() {
        setSendError(null);
        if (!phone) {
            setSendError("Enter phone");
            return;
        }
        if (!/^\d{8}$/.test(phone)) {
            setSendError("Phone must be exactly 8 digits");
            return;
        }
        setLoading(true);
        try {
            const res = await postJson("/demo/sms/send/", { phone }) as unknown;
            // try to pick token_id from response safely
            const body = res as Record<string, unknown> | null;
            const tid = body && typeof body.token_id === "string" ? body.token_id : null;
            setTokenId(tid);
            toast.push("SMS sent (simulated). Check Inbox.", "success");
        } catch (err: unknown) {
            console.error("sendSMS error:", printable(err));
            setSendError("Send failed: " + printable(err));
        } finally { setLoading(false); }
    }

    async function verify() {
        setVerifyMsg(null);
        setVerifyError(null);
        const trimmed = token.trim();
        if (!trimmed) {
            setVerifyError("Please enter a code (cannot be empty)");
            return;
        }
        setLoading(true);
        try {
            const res = await postJson("/demo/sms/verify/", { token: trimmed }) as unknown;
            const body = res as Record<string, unknown> | null;
            if (body && (body.detail === "sms_verified" || body.detail === "verified")) {
                setVerifyMsg("SMS verified");
                toast.push("SMS verified ✅", "success");
            } else if (body && typeof body.error === "string") {
                setVerifyError(body.error);
                toast.push("SMS verify failed: " + body.error, "error");
            } else {
                setVerifyError("Unknown response: " + JSON.stringify(body));
            }
        } catch (err: unknown) {
            console.error("verify error:", printable(err));
            const msg = printable(err);
            // Attempt to extract simpler error if it's a JSON error object
            if (msg.includes("invalid_token")) setVerifyError("Invalid token");
            else setVerifyError(msg);
        } finally { setLoading(false); }
    }

    return (
        <div className="form-card">
            <h3 className="font-semibold">Send & verify SMS (simulated)</h3>
            <p className="text-sm text-gray-600">Enter a phone number and send. Open Inbox to read the token, then paste here to verify.</p>

            <div className="mt-3 flex gap-2">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216" className="border rounded p-2" />
                <button onClick={sendSMS} className="btn-primary" disabled={loading}>Send</button>
            </div>

            {sendError && <div className="mt-2 text-red-600 font-semibold">{sendError}</div>}

            <div className="mt-3">
                <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Enter code" className="border rounded p-2 w-48" />
                <button onClick={verify} className="btn-outline ml-2" disabled={loading}>Verify</button>
            </div>

            {verifyMsg && <div className="mt-2 text-green-600 font-semibold">{verifyMsg}</div>}
            {verifyError && <div className="mt-2 text-red-600 font-semibold">{verifyError}</div>}

            {tokenId && <div className="mt-3 text-sm text-gray-600">Token id (debug): {tokenId}</div>}
        </div>
    );
}
