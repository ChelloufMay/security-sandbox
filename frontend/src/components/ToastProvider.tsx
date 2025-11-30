// frontend/src/components/ToastProvider.tsx
import React, { useEffect, useState } from "react";
import ToastCtx, { createToastController } from "./ToastContext";

const controller = createToastController();

export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Array<{ id: string; text: string; tone?: string }>>([]);

    useEffect(() => {
        const unsub = controller.subscribe((t) => setToasts(t));
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setToasts([]); };
        window.addEventListener("keydown", onKey);
        return () => { unsub(); window.removeEventListener("keydown", onKey); };
    }, []);

    return (
        <ToastCtx.Provider value={{ push: controller.push }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <div key={t.id} className={
                        "pointer-events-auto max-w-sm rounded p-3 text-sm shadow-md " +
                        (t.tone === "success" ? "bg-green-50 text-green-900 border border-green-100" :
                            t.tone === "error" ? "bg-red-50 text-red-900 border border-red-100" :
                                "bg-white text-gray-800 border")
                    }>
                        {t.text}
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    );
}
