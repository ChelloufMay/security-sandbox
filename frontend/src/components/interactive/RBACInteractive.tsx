import { useState } from "react";
import { postJson } from "../../services/api";
import { useToast } from "../ToastContext";

function safeStringify(value: unknown): string {
    try {
        if (value instanceof Error) return value.message;
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

export default function RBACInteractive() {
    const [role, setRole] = useState<string>("admin");
    const [createdId, setCreatedId] = useState<string | null>(null);
    const [approveId, setApproveId] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [lastResponse, setLastResponse] = useState<string | null>(null);
    const toast = useToast();

    async function requestRole() {
        setLoading(true);
        setLastResponse(null);
        try {
            const res = await postJson("/role/request/", { role });
            if (res && typeof res === "object" && "id" in res && typeof (res as Record<string, unknown>).id === "string") {
                const id = (res as Record<string, unknown>).id as string;
                setCreatedId(id);
                setLastResponse("Created request id: " + id);
                toast.push(`Role request created (id=${id})`, "success");
            } else {
                setLastResponse("Response: " + safeStringify(res));
                toast.push("Role request response", "info");
            }
        } catch (err: unknown) {
            console.error("requestRole error:", safeStringify(err));
            setLastResponse("Error: " + safeStringify(err));
            toast.push("Request failed: " + safeStringify(err), "error");
        } finally {
            setLoading(false);
        }
    }

    async function approve() {
        if (!approveId) { toast.push("Enter request id to approve", "error"); return; }
        setLoading(true);
        setLastResponse(null);
        try {
            const res = await postJson("/role/approve/", { id: approveId });
            setLastResponse("Approve response: " + safeStringify(res));
            toast.push("Approve response received", "success");
        } catch (err: unknown) {
            console.error("approve error:", safeStringify(err));
            setLastResponse("Approve failed: " + safeStringify(err));
            toast.push("Approve failed: " + safeStringify(err), "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-card">
            <h3 className="font-semibold">RBAC (request a role / approve)</h3>
            <p className="text-sm text-gray-600">Request a role. Admins approve by entering the request id below.</p>

            <div className="mt-3 flex gap-2 items-center">
                <select value={role} onChange={(e) => setRole(e.target.value)} className="border rounded p-2">
                    <option value="admin">admin</option>
                    <option value="moderator">moderator</option>
                    <option value="user">user</option>
                </select>
                <button onClick={requestRole} className="btn-primary" disabled={loading}>Request role</button>
            </div>

            {createdId && <div className="mt-3 text-sm">Created request id: <code>{createdId}</code></div>}

            <div className="mt-4">
                <h4 className="font-medium">Approve request (admin)</h4>
                <div className="flex gap-2 mt-2">
                    <input value={approveId} onChange={(e) => setApproveId(e.target.value)} placeholder="role-request-id" className="border rounded p-2" />
                    <button onClick={approve} className="btn-outline" disabled={loading}>Approve</button>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                    After approval, the user's Profile.role is set on the server for the demo expiry time (15 minutes). Check Logs → Refresh to confirm.
                </div>
            </div>

            {lastResponse && <div className="mt-3 p-2 bg-white border rounded text-sm"><strong>Last server response:</strong><pre className="whitespace-pre-wrap">{lastResponse}</pre></div>}
        </div>
    );
}
