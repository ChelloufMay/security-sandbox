// frontend/src/services/api.ts
export type ApiError = { status: number; body: unknown | null };

const API_BASE = import.meta.env.VITE_API_BASE ?? "/";

/** read cookie by name (for csrftoken) */
function readCookie(name: string): string | null {
    const v = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
    return v ? decodeURIComponent(v[2]) : null;
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE.replace(/\/$/, "")}${path}`;
    const headers = new Headers(opts.headers ?? {});
    // if body present and content-type missing, assume JSON
    if (opts.method && opts.method !== "GET" && opts.method !== "HEAD") {
        if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
        // attach CSRF token if available (Django uses 'csrftoken' cookie by default)
        const csrf = readCookie("csrftoken");
        if (csrf && !headers.has("X-CSRFToken")) headers.set("X-CSRFToken", csrf);
    }
    const merged: RequestInit = { credentials: "include", ...opts, headers };
    return fetch(url, merged);
}

export async function getJson(path: string): Promise<unknown> {
    const r = await apiFetch(path, { method: "GET" });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw { status: r.status, body: j } as ApiError;
    return j;
}

export async function postJson(path: string, body?: unknown): Promise<unknown> {
    const r = await apiFetch(path, {
        method: "POST",
        body: body !== undefined ? JSON.stringify(body) : undefined
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw { status: r.status, body: j } as ApiError;
    return j;
}
