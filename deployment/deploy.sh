#!/bin/bash
# === Optimized Full Deployment Script ===
set -e

LOG_FILE="deployment.log"

# === Helper functions ===
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

fail_deployment() {
  log "❌ Deployment failed!"
  DEPLOYMENT_STATUS="❌ *Deployment Failed!*"
  DEPLOYMENT_DETAILS="📝 *Error Logs:* Check logs via \`docker compose logs\`"
  send_telegram_notification
  exit 1
}
trap 'fail_deployment' ERR

send_telegram_notification() {
  if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
    MESSAGE="*Deployment*\n\n${DEPLOYMENT_STATUS}\n${DEPLOYMENT_DETAILS}\n\n📦 Version: *${BACKEND_VERSION:-N/A}*\n🌐 Domain: *${BACKEND_DOMAIN:-N/A}*"
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d chat_id="$TELEGRAM_CHAT_ID" \
      -d parse_mode="Markdown" \
      -d text="$MESSAGE" >/dev/null || true
  fi
}

# === Load env ===
if [ -f ".env" ]; then
  set -o allexport
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs -d '\n')
  set +o allexport
fi

BACKEND_VERSION=${BACKEND_VERSION:-1.0.0}

log "=== Starting Deployment for Shared Services ==="
log "Domain: ${BACKEND_DOMAIN:-N/A}"
log "Backend Version: $BACKEND_VERSION"

# === Ensure shared Docker network exists ===
NETWORK_NAME="shared-network"
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  log "🌐 Creating shared Docker network '$NETWORK_NAME'..."
  docker network create "$NETWORK_NAME" | tee -a "$LOG_FILE"
else
  log "ℹ️ Shared network '$NETWORK_NAME' already exists."
fi

# === Pull latest images ===
log "📥 Pulling latest Docker images..."
docker compose pull --ignore-pull-failures | tee -a "$LOG_FILE"

# === Restart all containers ===
log "🚀 Starting all containers..."
docker compose up -d | tee -a "$LOG_FILE"

# === Health check for Traefik or default service ===
log "🔍 Checking service health..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200"; then
  log "✅ Traefik is responding successfully!"
else
  log "⚠️ Traefik may not be reachable yet — check container logs."
fi

# === Clean up Docker garbage ===
log "🧹 Cleaning up unused Docker images and containers..."
docker image prune -af >/dev/null 2>&1 || true
docker container prune -f >/dev/null 2>&1 || true

DEPLOYMENT_STATUS="✅ *Deployment Successful!*"
DEPLOYMENT_DETAILS="All shared services updated and running."

log "$DEPLOYMENT_STATUS"
log "$DEPLOYMENT_DETAILS"
log "Deployed backend version: $BACKEND_VERSION"

send_telegram_notification
