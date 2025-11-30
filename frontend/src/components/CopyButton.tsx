import { useToast } from "./ToastContext";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
    const toast = useToast();

    async function doCopy() {
        try {
            await navigator.clipboard.writeText(text);
            toast.push("Copied to clipboard", "success");
        } catch (e) {
            console.error("copy failed", e);
            toast.push("Copy failed", "error");
        }
    }

    return (
        <button
            type="button"
            onClick={doCopy}
            className="ml-2 inline-flex items-center gap-2 px-2 py-1 border rounded text-xs hover:bg-gray-50">
            {label}
        </button>
    );
}
