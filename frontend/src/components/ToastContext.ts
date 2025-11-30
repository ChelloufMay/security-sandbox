// frontend/src/components/ToastContext.ts
import { createContext, useContext } from "react";

export type Toast = { id: string; text: string; tone?: "info" | "success" | "error" };

type ToastContextShape = {
    push: (text: string, tone?: Toast["tone"], ttlMs?: number) => void;
};

const ToastCtx = createContext<ToastContextShape | null>(null);

export function useToast(): ToastContextShape {
    const ctx = useContext(ToastCtx);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx;
}

export function createToastController() {
    const listeners: Array<(t: Toast[]) => void> = [];
    let toasts: Toast[] = [];

    function subscribe(fn: (t: Toast[]) => void) {
        listeners.push(fn);
        fn(toasts);
        return () => {
            const idx = listeners.indexOf(fn);
            if (idx >= 0) listeners.splice(idx, 1);
        };
    }

    function push(text: string, tone: Toast["tone"] = "info", ttlMs = 4000) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        toasts = [...toasts, { id, text, tone }];
        listeners.forEach((l) => l(toasts));
        setTimeout(() => {
            toasts = toasts.filter((t) => t.id !== id);
            listeners.forEach((l) => l(toasts));
        }, ttlMs);
    }

    return { subscribe, push };
}

export default ToastCtx;
