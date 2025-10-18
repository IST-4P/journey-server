FROM node:22-slim AS builder

WORKDIR /workspace

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.*.json ./
COPY webpack.*.config.js ./

COPY apps/chat ./apps/chat
COPY libs/pulsar ./libs/pulsar
COPY libs/prisma ./libs/prisma
COPY libs/nestjs ./libs/nestjs
COPY libs/grpc ./libs/grpc

RUN npm install

RUN sed -i 's/protoc-gen-ts_proto=.*node_modules.*protoc-gen-ts_proto.cmd/protoc-gen-ts_proto=..\/..\/..\/..\/node_modules\/.bin\/protoc-gen-ts_proto/g' libs/grpc/project.json

RUN apt-get update && apt-get install -y protobuf-compiler

RUN npx nx build chat

FROM node:22-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY --from=builder /workspace/dist/apps/chat/package.json ./

ENV NODE_ENV=production

RUN npm install --omit=dev

COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/node_modules/@prisma-clients/chat/ ./node_modules/@prisma-clients/chat/

CMD ["node", "dist/apps/chat/main.js"]