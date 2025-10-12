FROM node:22-slim AS builder

WORKDIR /workspace

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.*.json ./
COPY webpack.*.config.js ./

COPY apps/user ./apps/user
COPY libs/pulsar ./libs/pulsar
COPY libs/prisma ./libs/prisma
COPY libs/nestjs ./libs/nestjs

RUN npm install

RUN apt-get update && apt-get install -y protobuf-compiler

RUN npx nx build user

FROM node:22-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY --from=builder /workspace/dist/apps/user/package.json ./

ENV NODE_ENV=production

RUN npm install --omit=dev

COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/node_modules/@prisma-clients/user/ ./node_modules/@prisma-clients/user/

CMD ["node", "dist/apps/user/main.js"]