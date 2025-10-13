FROM node:22-slim AS builder

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@9 --activate

RUN apt-get update && apt-get install -y openssl protobuf-compiler

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY nx.json ./
COPY tsconfig.*.json ./
COPY webpack.*.config.js ./

COPY apps/auth ./apps/auth
COPY libs/pulsar ./libs/pulsar
COPY libs/prisma ./libs/prisma
COPY libs/nestjs ./libs/nestjs
COPY libs/grpc ./libs/grpc

RUN pnpm install --frozen-lockfile

RUN sed -i 's/protoc-gen-ts_proto=.*node_modules.*protoc-gen-ts_proto.cmd/protoc-gen-ts_proto=..\/..\/..\/..\/node_modules\/.bin\/protoc-gen-ts_proto/g' libs/grpc/project.json

RUN pnpm exec nx build auth

FROM node:22-slim AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

RUN apt-get update && apt-get install -y openssl

COPY --from=builder /workspace/dist/apps/auth/package.json ./

ENV NODE_ENV=production

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/node_modules/@prisma-clients/auth/ ./node_modules/@prisma-clients/auth/

CMD ["node", "dist/apps/auth/main.js"]

