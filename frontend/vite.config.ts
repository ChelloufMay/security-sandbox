import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Proxy key backend paths to Django backend to avoid CORS and SameSite issues.
            // Adjust backend host/port if needed.
            "/demo": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            },
            "/register": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            },
            "/verify-email": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            },
            "/login": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            },
            "/logout": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            },
            "/inbox": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            },
            "/sms": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            },
            "/totp": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            },
            "/password": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            },
            "/role": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            },
            "/logs": {
                target: "http://localhost:8000",
                changeOrigin: true,
                secure: false
            }
        }
    }
});
