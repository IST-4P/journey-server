FROM node:22-slim AS builder

WORKDIR /workspace

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.*.json ./
COPY webpack.*.config.js ./

COPY apps/user ./apps/user
COPY libs/nats ./libs/nats
COPY libs/nestjs ./libs/nestjs
COPY libs/grpc ./libs/grpc
COPY libs/domain/user ./libs/domain/user
COPY libs/domain/shared ./libs/domain/shared

RUN npm install

RUN sed -i 's/protoc-gen-ts_proto=.*node_modules.*protoc-gen-ts_proto.cmd/protoc-gen-ts_proto=..\/..\/..\/..\/node_modules\/.bin\/protoc-gen-ts_proto/g' libs/grpc/project.json

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