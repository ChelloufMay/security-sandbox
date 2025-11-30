import React, { useCallback, useEffect, useState } from "react";
import { getJson, postJson } from "../../services/api";
import { useToast } from "../../components/ToastContext";
import { useNavigate } from "react-router-dom";

type VaultSummary = {
    id: string;
    name: string;
    managed: boolean;
    rotation_period: string;
    created_at?: string;
};

function safeStringify(value: unknown): string {
    try {
        if (value instanceof Error) return value.message;
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

// small client-side generator to make testing easier (server expects urlsafe base64)
function generateFernetKeyBase64(): string {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    let s = "";
    for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
    const b64 = btoa(s);
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") + "=";
}

export default function VaultList({ onSelect }: { onSelect?: (id: string) => void }){
    const [vaults, setVaults] = useState<VaultSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [name, setName] = useState<string>("");
    const [managed, setManaged] = useState<boolean>(true);
    const [rotation, setRotation] = useState<string>("monthly");
    const [keyB64, setKeyB64] = useState<string>("");
    const toast = useToast();
    const navigate = useNavigate();

    const fetchVaults = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getJson("/demo/vaults/");
            if (Array.isArray(res)) setVaults(res as VaultSummary[]);
            else setVaults([]);
        } catch (err: unknown) {
            console.error("fetchVaults error:", safeStringify(err));
            toast.push("Failed to fetch vaults: " + safeStringify(err), "error");
            setVaults([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchVaults().catch((e) => console.error("fetchVaults effect:", safeStringify(e)));
    }, [fetchVaults]);

    function onGenerateKey() {
        const k = generateFernetKeyBase64();
        setKeyB64(k);
        toast.push("Generated key (paste into key field if creating unmanaged vault)", "info");
    }

    async function createVault(e: React.FormEvent) {
        e.preventDefault();
        if (!name) { toast.push("Provide a vault name", "error"); return; }
        if (!managed && !keyB64) { toast.push("Unmanaged vault requires a key (generate or paste one)", "error"); return; }
        const payload: Record<string, unknown> = { name, managed, rotation_period: rotation };
        if (!managed) payload.key_b64 = keyB64;

        try {
            const res = await postJson("/demo/vaults/", payload);
            if (res && typeof res === "object" && "id" in res && typeof (res as Record<string, unknown>).id === "string") {
                const created = res as VaultSummary;
                setVaults((v) => [created, ...v]);
                setName("");
                setKeyB64("");
                setManaged(true);
                setRotation("monthly");
                toast.push("Vault created", "success");
            } else {
                toast.push("Create vault unexpected response: " + safeStringify(res), "error");
            }
        } catch (err: unknown) {
            console.error("createVault error:", safeStringify(err));
            toast.push("Create vault failed: " + safeStringify(err), "error");
        }
    }

    function openVault(id: string) {
        if (onSelect) return onSelect(id);
        navigate(`/features/vaults/${id}`);
    }

    return (
        <div>
            <form onSubmit={createVault} className="flex gap-2 flex-wrap items-center">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vault name" className="border rounded p-2" />
                <select value={rotation} onChange={(e) => setRotation(e.target.value)} className="border rounded p-2">
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                    <option value="none">none</option>
                </select>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={managed} onChange={(e) => setManaged(e.target.checked)} />
                    Managed
                </label>

                {!managed && (
                    <>
                        <input value={keyB64} onChange={(e) => setKeyB64(e.target.value)} placeholder="base64 vault key (44 chars)" className="border rounded p-2 w-64" />
                        <button type="button" onClick={onGenerateKey} className="btn-outline">Generate key</button>
                    </>
                )}

                <button type="submit" className="px-3 py-1 bg-primary-500 text-white rounded">Create</button>
            </form>

            <div className="mt-4">
                {loading && <div>Loading vaults...</div>}
                {!loading && vaults.length === 0 && <div className="text-gray-500">No vaults</div>}
                <div className="grid gap-3 mt-2">
                    {vaults.map((v) => (
                        <div key={v.id} className="border p-3 rounded bg-white flex justify-between items-center">
                            <div>
                                <div className="font-medium">{v.name}</div>
                                <div className="text-xs text-gray-500">Managed: {String(v.managed)} • Rotation: {v.rotation_period}</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => openVault(v.id)} className="px-3 py-1 border rounded text-sm">Open</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
