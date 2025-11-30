// frontend/src/pages/Logs.tsx
import { useEffect, useState } from "react";
import { getJson } from "../services/api";
import { useToast } from "../components/ToastContext";

type LogEvent = {
    id?: string;
    timestamp?: string;
    event_type?: string;
    payload?: Record<string, unknown>;
};

export default function Logs() {
    const [logs, setLogs] = useState<LogEvent[]>([]);
    const toast = useToast();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = (await getJson("/logs/")) as LogEvent[];
                if (mounted && Array.isArray(res)) setLogs(res);
            } catch (e) {
                console.error(e);
                toast.push("Failed to load logs", "error");
            }
        })();
        return () => { mounted = false; };
    }, [toast]);

    return (
        <div>
            <h2 className="text-2xl text-primary-700 font-semibold">Logs</h2>
            <div className="mt-4 space-y-2">
                {logs.length === 0 && <div className="text-gray-500">No logs yet.</div>}
                {logs.map((l) => (
                    <div key={l.id} className="border rounded p-3 bg-white">
                        <div className="text-sm text-gray-600">{l.timestamp} — {l.event_type}</div>
                        <div className="text-sm text-gray-700 mt-1">{JSON.stringify(l.payload)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
