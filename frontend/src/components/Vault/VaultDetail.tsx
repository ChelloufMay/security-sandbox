import React, { useEffect, useState } from "react";
import { getJson, postJson } from "../../services/api";
import { useToast } from "../ToastContext.ts";

type Vault = { id: string; name: string; managed: boolean; rotation_period?: string };
type StoredSecret = { id: string; name: string; created_at?: string };

export default function VaultDetail({ vaultId }: { vaultId: string }) {
    const [vault, setVault] = useState<Vault | null>(null);
    const [secretName, setSecretName] = useState("");
    const [secretValue, setSecretValue] = useState("");
    const [stored, setStored] = useState<StoredSecret[]>([]);
    const [rotating, setRotating] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (!vaultId) return;
        (async () => {
            try {
                const v = (await getJson(`/demo/vaults/${vaultId}/`)) as Vault;
                setVault(v);
            } catch (e) {
                console.error(e);
                toast.push("Failed to load vault", "error");
            }
        })();
    }, [toast, vaultId]);

    async function rotate() {
        if (!vaultId) return;
        setRotating(true);
        try {
            await postJson(`/demo/vaults/${vaultId}/rotate/`);
            toast.push("Vault rotated", "success");
            const v = (await getJson(`/demo/vaults/${vaultId}/`)) as Vault;
            setVault(v);
        } catch (e) {
            console.error(e);
            toast.push("Rotate failed", "error");
        } finally {
            setRotating(false);
        }
    }

    async function storeSecret(e: React.FormEvent) {
        e.preventDefault();
        if (!vaultId) return;
        try {
            const res = (await postJson(`/demo/vaults/${vaultId}/secrets/`, { name: secretName, value: secretValue })) as StoredSecret;
            if (res?.id) setStored((s) => [res, ...s]);
            setSecretName("");
            setSecretValue("");
            toast.push("Secret stored", "success");
        } catch (e) {
            console.error(e);
            toast.push("Store failed", "error");
        }
    }

    async function retrieve(id: string) {
        try {
            const res = (await getJson(`/demo/vaults/${vaultId}/secrets/${id}/`)) as { value?: string };
            if (res?.value) {
                try { await navigator.clipboard.writeText(res.value); } catch (copyErr) { console.warn("copy failed", copyErr); }
                toast.push("Secret retrieved and copied", "success");
            } else {
                toast.push("Retrieve failed or empty secret", "error");
            }
        } catch (e) {
            console.error(e);
            toast.push("Retrieve failed", "error");
        }
    }

    if (!vault) return <div>Loading vault...</div>;

    return (
        <div>
            <h3 className="text-xl font-semibold">{vault.name}</h3>
            <div className="text-sm text-gray-600">Managed: {String(vault.managed)}</div>
            <div className="flex gap-2 mt-3">
                <button onClick={rotate} disabled={rotating} className="btn-primary">{rotating ? "Rotating..." : "Rotate"}</button>
            </div>

            <form onSubmit={storeSecret} className="mt-4 space-y-2">
                <input value={secretName} onChange={(e)=>setSecretName(e.target.value)} placeholder="secret name" className="border rounded p-2 w-full" />
                <input value={secretValue} onChange={(e)=>setSecretValue(e.target.value)} placeholder="secret value" className="border rounded p-2 w-full" />
                <div><button className="btn-primary">Store secret</button></div>
            </form>

            <div className="mt-4">
                <h4 className="font-medium">Stored secrets (recent)</h4>
                <div className="space-y-2 mt-2">
                    {stored.map((s) => (
                        <div key={s.id} className="border p-2 rounded bg-white flex justify-between items-center">
                            <div>{s.name}</div>
                            <div className="flex items-center gap-2">
                                <button onClick={()=>retrieve(s.id)} className="px-2 py-1 border rounded text-sm">Retrieve</button>
                            </div>
                        </div>
                    ))}
                    {!stored.length && <div className="text-gray-500">No stored secrets shown (create to see them here)</div>}
                </div>
            </div>
        </div>
    );
}
