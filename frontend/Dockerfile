# frontend/Dockerfile.dev
FROM node:22.18.0

WORKDIR /app

# copy only package files first to use Docker cache
COPY package*.json ./

# install deps (npm 10.9.3 compatible)
RUN npm ci

# copy source
COPY . .

# expose vite dev server port
EXPOSE 5173

# allow Vite to bind to 0.0.0.0 so it's reachable from host/docker
ENV HOST=0.0.0.0
ENV CHOKIDAR_USEPOLLING=true

# start dev server (vite) and bind to 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
