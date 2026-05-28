FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config
COPY package.json turbo.json pnpm-workspace.yaml* ./
COPY packages/ ./packages/
COPY apps/backend/package.json ./apps/backend/

# Install only backend + shared deps
RUN pnpm install --filter @vedaai/backend --filter @vedaai/shared

COPY apps/backend/ ./apps/backend/

WORKDIR /app/apps/backend
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/backend/dist ./dist
COPY --from=base /app/apps/backend/package.json .

EXPOSE 4000

CMD ["node", "dist/index.js"]
