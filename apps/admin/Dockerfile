FROM node:22-slim AS builder

WORKDIR /workspace

RUN apt-get update && apt-get install -y protobuf-compiler

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.*.json ./
COPY webpack.*.config.js ./

COPY apps/admin ./apps/admin
COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs
COPY libs/nats ./libs/nats
COPY libs/domain ./libs/domain

RUN npm install

RUN sed -i 's/protoc-gen-ts_proto=.*node_modules.*protoc-gen-ts_proto.cmd/protoc-gen-ts_proto=..\/..\/..\/..\/node_modules\/.bin\/protoc-gen-ts_proto/g' libs/grpc/project.json

RUN npx nx build admin

FROM node:22-slim AS runner

WORKDIR /app

COPY --from=builder /workspace/dist/apps/admin/package.json ./

ENV NODE_ENV=production

RUN npm install --omit=dev

COPY --from=builder /workspace/dist ./dist

CMD ["node", "dist/apps/admin/main.js"]