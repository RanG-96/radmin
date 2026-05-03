# Build stage
ARG IMAGE_REGISTRY=""
FROM ${IMAGE_REGISTRY}rust:1.88-bookworm AS builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY migrations ./migrations

RUN cargo build --release

# Runtime stage
FROM ${IMAGE_REGISTRY}debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/my_admin_backend /usr/local/bin/app

ENV RUST_LOG=info

EXPOSE 3000

CMD ["app"]
