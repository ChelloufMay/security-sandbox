import { useCallback, useEffect, useState } from "react";
import { getJson } from "../../services/api";
import { useToast } from "../ToastContext";

type InboxItem = {
    id?: string;
    to: string;
    type: "email" | "sms";
    subject?: string;
    body: string;
    created_at?: string;
};

function printable(v: unknown) {
    if (v instanceof Error) return v.message;
    try { return JSON.stringify(v); } catch { return String(v); }
}

export default function InboxInteractive() {
    const [filter, setFilter] = useState<"all" | "email" | "sms">("all");
    const [items, setItems] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useToast();

    const fetchInbox = useCallback(async () => {
        setLoading(true);
        try {
            const q = filter === "all" ? "/inbox/" : `/inbox/?type=${filter}`;
            const res = await getJson(q);
            if (Array.isArray(res)) {
                // runtime-check items shape loosely
                setItems(res as InboxItem[]);
            } else {
                setItems([]);
                toast.push("Unexpected inbox response format", "error");
            }
        } catch (err: unknown) {
            console.error("fetchInbox error:", printable(err));
            toast.push("Failed to load inbox: " + printable(err), "error");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [filter, toast]);

    useEffect(() => {
        // call and handle promise inside effect
        fetchInbox().catch((e) => console.error("fetchInbox effect error:", printable(e)));
    }, [fetchInbox]);

    return (
        <div className="form-card">
            <h3 className="font-semibold">Inbox (simulated)</h3>
            <p className="text-sm text-gray-600">MailHog captures emails; this lists messages created by backend.</p>

            <div className="mt-3 flex items-center gap-2">
                <label className="text-sm">Filter:</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "email" | "sms")} className="border rounded p-1">
                    <option value="all">All</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                </select>
                <button onClick={() => fetchInbox()} className="btn-outline" disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
            </div>

            <div className="mt-3 space-y-2">
                {loading && <div className="text-sm text-gray-500">Loading...</div>}
                {!loading && items.length === 0 && <div className="text-gray-500">No messages</div>}
                {items.map((m, i) => (
                    <div key={m.id ?? i} className="border p-2 rounded bg-white">
                        <div className="flex justify-between">
                            <div><strong>{m.type.toUpperCase()}</strong> — {m.subject ?? ""}</div>
                            <div className="text-xs text-gray-500">{m.created_at ?? ""}</div>
                        </div>
                        <pre className="mt-2 whitespace-pre-wrap text-sm">{m.body}</pre>
                    </div>
                ))}
            </div>
        </div>
    );
}
