FROM node:22-slim AS builder

WORKDIR /workspace

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.*.json ./
COPY webpack.*.config.js ./

COPY apps/auth ./apps/auth
COPY libs/pulsar ./libs/pulsar
COPY libs/prisma ./libs/prisma
COPY libs/nestjs ./libs/nestjs
COPY libs/grpc ./libs/grpc

RUN npm install

RUN apt-get update && apt-get install -y protobuf-compiler

RUN npx nx build auth

FROM node:22-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY --from=builder /workspace/dist/apps/auth/package.json ./

ENV NODE_ENV=production

RUN npm install --omit=dev

COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/node_modules/@prisma-clients/auth/ ./node_modules/@prisma-clients/auth/

CMD ["node", "dist/apps/auth/main.js"]

