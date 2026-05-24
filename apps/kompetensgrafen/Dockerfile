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
RUN ls -la apps/kompetensgrafen/.next/standalone/ && \
    ls -la apps/kompetensgrafen/.next/standalone/apps/kompetensgrafen/ 2>&1 || echo "no nested dir"

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0
COPY --from=builder /repo/apps/kompetensgrafen/.next/standalone ./
COPY --from=builder /repo/apps/kompetensgrafen/.next/static ./apps/kompetensgrafen/.next/static
RUN ls -la /app/ && ls -la /app/apps/kompetensgrafen/ 2>&1 || echo "no app dir"
EXPOSE 8080
CMD ["sh", "-c", "echo 'CMD running, PORT='$PORT && node apps/kompetensgrafen/server.js"]
