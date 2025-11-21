# frontend/Dockerfile (development-friendly for Vite + React)
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies (use package-lock.json if present)
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---- Dev image (fast, mounts local files for HMR) ----
FROM node:18-alpine AS dev
WORKDIR /app

# copy installed deps from previous stage for faster startup
COPY --from=deps /app/node_modules ./node_modules

# copy app source (when building image; for dev you'll mount the local folder)
COPY . .

EXPOSE 5173

# Run Vite dev server and bind to all interfaces so Docker host can reach it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ----Production build image (multi-stage) ----
#
# FROM node:18-alpine AS build
# WORKDIR /app
# COPY package.json package-lock.json* ./
# RUN npm ci --no-audit --no-fund
# COPY . .
# RUN npm run build
#
# FROM nginx:stable-alpine AS production
# COPY --from=build /app/dist /usr/share/nginx/html
# # Optionally copy your custom nginx.conf to /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
