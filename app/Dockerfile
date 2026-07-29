FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY app/package.json app/package-lock.json* ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_CUSDC_ADDRESS
ENV NEXT_PUBLIC_CUSDC_ADDRESS=$NEXT_PUBLIC_CUSDC_ADDRESS

ARG NEXT_PUBLIC_CWETH_ADDRESS
ENV NEXT_PUBLIC_CWETH_ADDRESS=$NEXT_PUBLIC_CWETH_ADDRESS

ARG NEXT_PUBLIC_DEPLOY_BLOCK_NUMBER
ENV NEXT_PUBLIC_DEPLOY_BLOCK_NUMBER=$NEXT_PUBLIC_DEPLOY_BLOCK_NUMBER

ARG NEXT_PUBLIC_INTENT_POOL_ADDRESS
ENV NEXT_PUBLIC_INTENT_POOL_ADDRESS=$NEXT_PUBLIC_INTENT_POOL_ADDRESS

ARG NEXT_PUBLIC_NOXSHIELD_ROUTER_ADDRESS
ENV NEXT_PUBLIC_NOXSHIELD_ROUTER_ADDRESS=$NEXT_PUBLIC_NOXSHIELD_ROUTER_ADDRESS

ARG NEXT_PUBLIC_NOXSHIELD_VAULT_ADDRESS
ENV NEXT_PUBLIC_NOXSHIELD_VAULT_ADDRESS=$NEXT_PUBLIC_NOXSHIELD_VAULT_ADDRESS

ARG NEXT_PUBLIC_SEPOLIA_RPC_URL
ENV NEXT_PUBLIC_SEPOLIA_RPC_URL=$NEXT_PUBLIC_SEPOLIA_RPC_URL

ARG NEXT_PUBLIC_USDC_ADDRESS
ENV NEXT_PUBLIC_USDC_ADDRESS=$NEXT_PUBLIC_USDC_ADDRESS

ARG NEXT_PUBLIC_WETH_ADDRESS
ENV NEXT_PUBLIC_WETH_ADDRESS=$NEXT_PUBLIC_WETH_ADDRESS

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
