FROM node:22-bookworm-slim AS build

ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

COPY . .

RUN npm run build

FROM node:22-bookworm-slim AS runtime

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    golang-go \
    rustc \
    cargo \
    php-cli \
    ruby \
    python3 \
    g++ \
    gcc \
    default-jdk \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000

CMD ["npm", "run", "start"]
