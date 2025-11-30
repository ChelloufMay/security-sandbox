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
    if (!vault) return <div>Loading vault...</div>;

    return (
        <div>
            <div className="form-card">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-2xl font-semibold">{vault.name}</h3>
                        <div className="text-sm text-gray-600 mt-1">Managed: {String(vault.managed)}</div>
                        {vault.rotation_period && <div className="text-sm text-gray-600">Rotation: {vault.rotation_period}</div>}
                    </div>

                </div>

                <form onSubmit={storeSecret} className="mt-4">
                    <div className="form-field">
                        <label className="block text-sm font-medium mb-1">Secret name</label>
                        <input
                            value={secretName}
                            onChange={(e) => setSecretName(e.target.value)}
                            placeholder="e.g. DB_PASSWORD"
                            className="w-full"
                        />
                    </div>

                    <div className="form-field">
                        <label className="block text-sm font-medium mb-1">Secret value</label>
                        <input
                            value={secretValue}
                            onChange={(e) => setSecretValue(e.target.value)}
                            placeholder="secret value"
                            className="w-full"
                        />
                    </div>

                    <div className="form-actions">
                        <button className="btn-primary" type="submit">Store secret</button>
                    </div>
                </form>
            </div>

            <div className="mt-4">
                <h4 className="text-lg font-medium">Stored secrets (recent)</h4>
                <div className="space-y-2 mt-2">
                    {stored.map((s) => (
                        <div key={s.id} className="bg-white border rounded p-3 flex items-center justify-between">
                            <div>
                                <div className="font-medium">{s.name}</div>
                                <div className="text-xs text-gray-500">{s.created_at ? new Date(s.created_at).toLocaleString() : ""}</div>
                            </div>
                            <div className="text-xs text-gray-500">ID: <code className="break-all text-xs">{s.id}</code></div>
                        </div>
                    ))}
                    {!stored.length && <div className="text-gray-500">No stored secrets shown (create to see them here)</div>}
                </div>
            </div>
        </div>
    );
}