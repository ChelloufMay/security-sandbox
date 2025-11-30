// frontend/src/pages/Demo/VaultList.tsx
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

function generateFernetKeyBase64(): string {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    let s = "";
    for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
    const b64 = btoa(s);
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") + "=";
}

export default function VaultList({ onSelect }: { onSelect?: (id: string) => void }) {
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
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.push("Provide a vault name", "error");
            return;
        }
        if (!managed && !keyB64) {
            toast.push("Unmanaged vault requires a key (generate or paste one)", "error");
            return;
        }
        const payload: Record<string, unknown> = { name: trimmedName, managed, rotation_period: rotation };
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
        const current = location.pathname || "";
        if (current.startsWith("/features") || current.includes("/features/")) {
            navigate(`/features/vaults/${id}`);
        } else {
            navigate(`/vaults/${id}`);
        }
    }

    return (
        <div>
            {/* Create form — uses form-card and form-field for consistent spacing */}
            <div className="form-card">
                <form onSubmit={createVault} className="flex flex-col md:flex-row md:items-end gap-3">
                    <div className="flex-1">
                        <div className="form-field">
                            <label className="block text-sm font-medium mb-1">Vault name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My secret vault"
                                className="w-full"
                                aria-label="Vault name"
                            />
                        </div>
                    </div>

                    <div className="w-40">
                        <div className="form-field">
                            <label className="block text-sm font-medium mb-1">Rotation</label>
                            <select value={rotation} onChange={(e) => setRotation(e.target.value)} className="w-full">
                                <option value="monthly">monthly</option>
                                <option value="yearly">yearly</option>
                                <option value="none">none</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-36">
                        <div className="form-field">
                            <label className="inline-flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={managed}
                                    onChange={(e) => setManaged(e.target.checked)}
                                    aria-label="Managed vault"
                                />
                                <span>Managed</span>
                            </label>
                        </div>
                    </div>

                    {!managed && (
                        <div className="flex-1 md:w-64">
                            <div className="form-field">
                                <label className="block text-sm font-medium mb-1">Vault key</label>
                                <input
                                    value={keyB64}
                                    onChange={(e) => setKeyB64(e.target.value)}
                                    placeholder="base64 vault key (44 chars)"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-actions md:ml-2">
                        {!managed && (
                            <button type="button" onClick={onGenerateKey} className="btn-outline" title="Generate base64 key">
                                Generate key
                            </button>
                        )}
                        <button type="submit" className="btn-primary" aria-label="Create vault">
                            Create
                        </button>
                    </div>
                </form>
            </div>

            {/* Vaults grid */}
            <div className="mt-4">
                {loading && <div className="text-sm text-gray-600">Loading vaults...</div>}
                {!loading && vaults.length === 0 && <div className="text-gray-500">No vaults</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                    {vaults.map((v) => (
                        <div
                            key={v.id}
                            className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1"
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold"
                                    style={{ background: "linear-gradient(180deg, rgba(14,165,233,0.12), rgba(3,105,161,0.06))", color: "var(--primary-700)" }}
                                >
                                    {v.name?.charAt(0).toUpperCase() || "V"}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <div className="text-lg font-semibold">{v.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {v.created_at ? new Date(v.created_at).toLocaleString() : ""}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: "rgba(2,6,23,0.06)" }}>
                                                {v.rotation_period}
                                            </div>

                                            {/* Managed: checkbox (read-only) instead of badge */}
                                            <label className="inline-flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={v.managed}
                                                    readOnly
                                                    disabled
                                                    aria-label={`Vault ${v.name} managed`}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">{v.managed ? "Managed" : "Unmanaged"}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <div className="text-sm text-gray-600">ID: <code className="break-all text-xs">{v.id}</code></div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openVault(v.id)}
                                                className="btn-primary"
                                                aria-label={`Open vault ${v.name}`}
                                            >
                                                Open
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
