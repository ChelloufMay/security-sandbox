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
            <p className="text-sm text-gray-600 mb-2">
                Demande de rôle. Les administrateurs approuvent la demande en saisissant l'identifiant ci-dessous.
            </p>
            <div className="p-2 bg-blue-50 text-xs text-blue-800 rounded mb-3">
                <strong>Demo Info:</strong>
                <ul className="list-disc ml-4 mt-1">
                    <li>TCette démonstration simule le<em>processus</em> de demande et d'approbation des rôles.</li>
                    <li><strong>Admin:</strong> Peut approuver les demandes.</li>
                    <li><strong>Operator (Moderator):</strong> Dans une application réelle, elle permet la modération du contenu.</li>
                </ul>
                <strong>Demander le rôle d’« administrateur » ou d’« opérateur » ici ne vous accorde pas de véritables privilèges de superutilisateur backend dans cet environnement sandbox (mesure de sécurité), mais met à jour votre rôle de profil pendant 15 minutes.</strong>
            </div>

            <div className="mt-3 flex gap-2 items-center">
                <select value={role} onChange={(e) => setRole(e.target.value)} className="border rounded p-2">
                    <option value="admin">admin</option>
                    <option value="operator">moderator (operator)</option>
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
                    Après validation, le rôle de l'utilisateur est défini sur le serveur pour la durée de la démo (15 minutes).  Check Logs → Refresh to confirm.
                </div>
            </div>

            {lastResponse && <div className="mt-3 p-2 bg-white border rounded text-sm"><strong>Last server response:</strong><pre className="whitespace-pre-wrap">{lastResponse}</pre></div>}
        </div>
    );
}
