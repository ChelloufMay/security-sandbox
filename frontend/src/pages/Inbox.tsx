// frontend/src/pages/Inbox.tsx
import { useEffect, useState } from "react";
import { getJson } from "../services/api";
import { useToast } from "../components/ToastContext";
import CopyButton from "../components/CopyButton";

type InboxItem = {
    id?: string;
    to?: string;
    type?: string;
    subject?: string;
    body?: string;
    created_at?: string;
};

export default function Inbox() {
    const [items, setItems] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = (await getJson("/inbox/")) as InboxItem[];
                if (mounted) setItems(res ?? []);
            } catch (e) {
                console.error(e);
                toast.push("Failed to load inbox", "error");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [toast]);

    return (
        <div>
            <h2 className="text-2xl text-primary-700 font-semibold">Inbox</h2>
            {loading ? <div className="mt-4">Loading...</div> : null}
            <div className="mt-4 space-y-4">
                {items.length === 0 && !loading && <div className="text-gray-500">No messages yet.</div>}
                {items.map((m) => (
                    <div key={m.id ?? m.created_at} className="border rounded p-3 bg-white">
                        <div className="flex justify-between items-start gap-3">
                            <div>
                                <div className="text-sm text-gray-700"><strong>To:</strong> {m.to}</div>
                                <div className="text-sm text-gray-700"><strong>Type:</strong> {m.type}</div>
                                <div className="text-sm text-gray-700"><strong>Subject:</strong> {m.subject}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500">{m.created_at}</div>
                            </div>
                        </div>

                        <pre className="mt-3 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">{m.body}</pre>

                        <div className="mt-2 flex items-center">
                            <CopyButton text={m.body ?? ""} label="Copy message" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
