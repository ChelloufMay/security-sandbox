import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        // allow Vite to be reachable from other hosts (nginx inside Docker will reach host.docker.internal:5173)
        // This is required so the nginx container can proxy to your host dev server for HMR and assets.
        host: true,
        allowedHosts: [
            "security-sandbox.test"
        ],
        port: 5173,
        proxy: {
            // Proxy key backend paths to Django backend to avoid CORS and SameSite issues.
            // Adjust backend host/port if needed.
            "/demo": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                // allow websocket proxying for HMR if these endpoints use websockets
                ws: true
            },
            "/register": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                ws: true
            },
            "/verify-email": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                ws: true
            },
            "/login": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                ws: true
            },
            "/logout": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                ws: true
            },
            "/inbox": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                ws: true
            },
            "/sms": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                ws: true
            },
            "/totp": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                ws: true
            },
            "/password": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                ws: true
            },
            "/role": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                ws: true
            },
            "/logs": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false,
                ws: true
            }
        }
    }
});
