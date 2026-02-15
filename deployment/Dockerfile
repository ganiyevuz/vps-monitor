# Use the official uv image with Python 3.12 and uv preinstalled
FROM ghcr.io/astral-sh/uv:python3.12-bookworm

# Set working directory
WORKDIR /app

# Set timezone
ENV TZ=Asia/Tashkent

# Enable bytecode compilation for performance
ENV UV_COMPILE_BYTECODE=1

# Force uv to copy instead of symlink (important in Docker bind mounts)
ENV UV_LINK_MODE=copy
ENV UV_NO_SOURCE=1

# SYSTEM DEPS: install OS-level dependencies (update this list if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    tzdata \
    poppler-utils \
    antiword \
    unrtf \
    libreoffice \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# Step 1: Install dependencies only (without app code)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-dev

# Step 2: Add full source and install the app package (only rebuilds if app code changes)
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

# Step 3: Install development dependencies (optional, only if you need them)

COPY entrypoint.sh /entrypoint.sh
#COPY aiobot/entrypoint.sh /aiobot-entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose app-level CLI or packages via venv
ENV PATH="/app/.venv/bin:$PATH"

# Default entrypoint (can be overridden by Docker Compose or `docker run`)
ENTRYPOINT ["/entrypoint.sh"]
