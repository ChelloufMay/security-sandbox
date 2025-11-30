// frontend/src/components/interactive/LogsInteractive.tsx
import { useEffect, useState, useCallback } from "react";
import { getJson } from "../../services/api";
import { useToast } from "../ToastContext";

type LogEvent = {
    id?: string;
    user?: string | null;
    event_type: string;
    payload?: Record<string, unknown>;
    timestamp?: string;
};

function printable(v: unknown) {
    if (v instanceof Error) return v.message;
    try {
        return JSON.stringify(v);
    } catch {
        return String(v);
    }
}

export default function LogsInteractive() {
    const [logs, setLogs] = useState<LogEvent[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useToast();

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getJson("/logs/");
            if (Array.isArray(res)) {
                setLogs(res as LogEvent[]);
            } else {
                setLogs([]);
                toast.push("Unexpected logs response format", "error");
            }
        } catch (err: unknown) {
            console.error("fetchLogs error:", printable(err));
            toast.push("Failed to fetch logs: " + printable(err), "error");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        // Make sure the promise is handled to avoid "Promise returned from effect is ignored" lint warning.
        fetchLogs().catch((e) => {
            console.error("fetchLogs effect error:", printable(e));
        });
    }, [fetchLogs]);

    return (
        <div className="form-card">
            <h3 className="font-semibold">Application logs</h3>
            <p className="text-sm text-gray-600">Recent events (register, login, verify, role requests, totp_setup, etc.).</p>

            <div className="mt-3">
                <button onClick={() => fetchLogs()} className="btn-outline" disabled={loading}>
                    {loading ? "Refreshing…" : "Refresh logs"}
                </button>
            </div>

            <div className="mt-3 space-y-2 max-h-80 overflow-auto">
                {loading && <div className="text-sm text-gray-500">Loading logs…</div>}
                {!loading && logs.length === 0 && <div className="text-gray-500">No logs yet</div>}
                {!loading &&
                    logs.map((l, i) => (
                        <div key={l.id ?? i} className="border p-2 rounded bg-white text-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <strong>{l.event_type}</strong>
                                    {l.user ? ` — ${String(l.user)}` : ""}
                                </div>
                                <div className="text-xs text-gray-400">{l.timestamp ?? ""}</div>
                            </div>
                            <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(l.payload ?? {}, null, 2)}</pre>
                        </div>
                    ))}
            </div>
        </div>
    );
}
