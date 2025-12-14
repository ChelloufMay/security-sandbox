import { useState } from "react";
import { postJson } from "../../services/api";
import { useToast } from "../../components/ToastContext";

type CipherResponse = { key: string; nonce: string; ciphertext: string };

function safeStringify(value: unknown): string {
    try {
        if (value instanceof Error) return value.message;
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

export default function Symmetric() {
    const [plaintext, setPlaintext] = useState<string>("hello world");
    const [cipher, setCipher] = useState<CipherResponse | null>(null);
    const [decrypted, setDecrypted] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useToast();

    const [message, setMessage] = useState<string | null>(null);

    async function encrypt() {
        setMessage(null);
        if (!plaintext.trim()) {
            setMessage("Please enter text to encrypt first.");
            toast.push("Empty plaintext", "error");
            return;
        }
        setLoading(true);
        setDecrypted(null);
        try {
            const res = await postJson("/demo/symmetric/encrypt/", { plaintext });
            if (res && typeof res === "object" && "ciphertext" in res) {
                setCipher(res as CipherResponse);
                toast.push("Encrypted", "success");
            } else {
                toast.push("Unexpected encrypt response", "error");
            }
        } catch (err: unknown) {
            console.error("encrypt error:", safeStringify(err));
            toast.push("Encryption failed: " + safeStringify(err), "error");
        } finally {
            setLoading(false);
        }
    }

    async function decrypt() {
        setMessage(null);
        // Note: The original request asked for: "if user presses on the decrypt button without a message to encrypt... needs to fill it"
        // This implies checking if plaintext was filled or if there is simply no cipher.
        // But logical flow is: can't decrypt if no ciphertext exists.
        if (!cipher) {
            setMessage("You need to encrypt something first before decrypting.");
            toast.push("No ciphertext", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await postJson("/demo/symmetric/decrypt/", { key: cipher.key, nonce: cipher.nonce, ciphertext: cipher.ciphertext });
            if (res && typeof res === "object" && "plaintext" in res) {
                setDecrypted((res as { plaintext: string }).plaintext);
                toast.push("Decrypted", "success");
            } else {
                toast.push("Unexpected decrypt response", "error");
            }
        } catch (err: unknown) {
            console.error("decrypt error:", safeStringify(err));
            toast.push("Decrypt failed: " + safeStringify(err), "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-4 form-card">
            <h3 className="font-semibold mb-2">Symmetric AES-GCM demo</h3>
            <textarea value={plaintext} onChange={(e) => setPlaintext(e.target.value)} rows={4} className="w-full border rounded p-2" />
            <div className="mt-3 flex gap-2">
                <button onClick={encrypt} className="btn-primary" disabled={loading}>Encrypt</button>
                <button onClick={decrypt} className="btn-outline" disabled={loading}>Decrypt</button>
            </div>

            {message && <div className="mt-2 text-red-600 font-medium">{message}</div>}

            {cipher && (
                <div className="mt-3 text-sm text-gray-700">
                    <div><strong>Key:</strong> <code className="break-all">{cipher.key}</code></div>
                    <div><strong>Nonce:</strong> <code className="break-all">{cipher.nonce}</code></div>
                    <div><strong>Ciphertext:</strong> <code className="break-all">{cipher.ciphertext}</code></div>
                </div>
            )}

            {decrypted && <div className="mt-3 p-2 bg-green-50 border rounded">Decrypted: {decrypted}</div>}
        </div>
    );
}
