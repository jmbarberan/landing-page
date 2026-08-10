FROM docker.io/library/node:20-alpine AS build
WORKDIR /app

RUN corepack enable

# pnpm-workspace.yaml lleva la allowlist allowBuilds. Sin el, pnpm 11 detecta
# builds bloqueados y sale con codigo 1 (ERR_PNPM_IGNORED_BUILDS), lo que aborta
# esta capa. Verificado reproduciendo la secuencia fuera de Docker.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM docker.io/library/nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
