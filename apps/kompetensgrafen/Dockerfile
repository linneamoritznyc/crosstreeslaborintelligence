# Build context = repo root (set dockerfilePath = "apps/kompetensgrafen/Dockerfile",
# leave rootDirectory unset on the Railway service).

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /repo
COPY pnpm-workspace.yaml package.json ./
COPY libs ./libs
COPY apps/kompetensgrafen ./apps/kompetensgrafen
RUN pnpm install --no-frozen-lockfile --filter kompetensgrafen...
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter kompetensgrafen build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0
COPY --from=builder /repo/apps/kompetensgrafen/.next/standalone ./
COPY --from=builder /repo/apps/kompetensgrafen/.next/static ./apps/kompetensgrafen/.next/static
EXPOSE 8080
# sh -c wrapper ensures stdout is line-buffered so startup logs surface in Railway.
CMD ["sh", "-c", "node apps/kompetensgrafen/server.js"]
