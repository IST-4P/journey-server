FROM node:22-slim AS builder

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@9 --activate

RUN apt-get update && apt-get install -y protobuf-compiler

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY nx.json ./
COPY tsconfig.*.json ./
COPY webpack.*.config.js ./

COPY apps/api ./apps/api
COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs

RUN pnpm install --frozen-lockfile

RUN sed -i 's/protoc-gen-ts_proto=.*node_modules.*protoc-gen-ts_proto.cmd/protoc-gen-ts_proto=..\/..\/..\/..\/node_modules\/.bin\/protoc-gen-ts_proto/g' libs/grpc/project.json

RUN pnpm exec nx build api

FROM node:22-slim AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY --from=builder /workspace/dist/apps/api/package.json ./

ENV NODE_ENV=production

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /workspace/dist ./dist

CMD ["node", "dist/apps/api/main.js"]