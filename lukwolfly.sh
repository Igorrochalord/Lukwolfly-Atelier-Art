#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# LUKWOLFLY — sobe o site em Docker + túnel Cloudflare
#
#   ./lukwolfly.sh up            build + sobe app + túnel rápido (trycloudflare)
#   ./lukwolfly.sh up --named    usa túnel nomeado (CLOUDFLARE_TUNNEL_TOKEN no .env)
#   ./lukwolfly.sh up --local    só o app, sem túnel
#   ./lukwolfly.sh up --dev      modo dev: código ao vivo (hot reload), sem rebuild
#                                (combina: ./lukwolfly.sh up --dev --local)
#   ./lukwolfly.sh update        rebuild só do site, mantendo o túnel (a URL não muda)
#   ./lukwolfly.sh url           mostra a URL pública atual
#   ./lukwolfly.sh senha         mostra a senha do painel /admin
#   ./lukwolfly.sh backup        salva banco + uploads em ./backups/
#   ./lukwolfly.sh logs [svc]    acompanha logs (app | tunnel)
#   ./lukwolfly.sh status        estado dos containers
#   ./lukwolfly.sh restart       reinicia (sem rebuild)
#   ./lukwolfly.sh down          derruba tudo (os dados ficam no volume)
# ─────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")"

PORT="${LUK_PORT:-3000}"
ENV_FILE=".env"
MODE_FILE=".lukwolfly-mode"
COMPOSE=(docker compose)
# modo dev fica registrado para os outros comandos (logs, url, update...)
if [[ -f "$MODE_FILE" && "$(cat "$MODE_FILE")" == "dev" ]]; then
  COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.dev.yml)
fi
export HOST_UID="$(id -u)" HOST_GID="$(id -g)"

c_lime=$'\e[1;92m'; c_lilac=$'\e[1;95m'; c_mute=$'\e[90m'; c_err=$'\e[1;31m'; c_off=$'\e[0m'
say()  { printf '%s✂%s %s\n' "$c_lime" "$c_off" "$*"; }
info() { printf '%s  %s%s\n' "$c_mute" "$*" "$c_off"; }
die()  { printf '%s✕ %s%s\n' "$c_err" "$*" "$c_off" >&2; exit 1; }

banner() {
  printf '%s' "$c_lime"
  cat <<'ART'

  ██╗     ██╗   ██╗██╗  ██╗██╗    ██╗ ██████╗ ██╗     ███████╗██╗  ██╗   ██╗
  ██║     ██║   ██║██║ ██╔╝██║    ██║██╔═══██╗██║     ██╔════╝██║  ╚██╗ ██╔╝
  ██║     ██║   ██║█████╔╝ ██║ █╗ ██║██║   ██║██║     █████╗  ██║   ╚████╔╝
  ██║     ██║   ██║██╔═██╗ ██║███╗██║██║   ██║██║     ██╔══╝  ██║    ╚██╔╝
  ███████╗╚██████╔╝██║  ██╗╚███╔███╔╝╚██████╔╝███████╗██║     ███████╗██║
  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚══╝╚══╝  ╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝
ART
  printf '%s  - - - - - - - - - - - - - -  atelier & art  - - - - - - - - - - - - - -%s\n\n' "$c_lilac" "$c_off"
}

require_docker() {
  command -v docker >/dev/null 2>&1 || die "Docker não encontrado. Instale o Docker Desktop / Engine."
  docker info >/dev/null 2>&1 || die "O daemon do Docker não está rodando."
  docker compose version >/dev/null 2>&1 || die "Docker Compose v2 não encontrado."
}

random_hex() {
  if command -v openssl >/dev/null 2>&1; then openssl rand -hex "$1"
  else head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'; fi
}

env_value() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- || true; }

# Cria .env na primeira execução, com senha do admin e segredo de sessão aleatórios.
ensure_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    local pw; pw="luk-$(random_hex 6)"
    say "Criando $ENV_FILE"
    {
      echo "# gerado por lukwolfly.sh em $(date -u +%Y-%m-%dT%H:%M:%SZ)"
      echo "SITE_URL=http://localhost:${PORT}"
      echo "ADMIN_PASSWORD=${pw}"
      echo "SESSION_SECRET=$(random_hex 32)"
      echo "# notificação de pedidos (opcional) — veja .env.example"
      echo "TELEGRAM_BOT_TOKEN="
      echo "TELEGRAM_CHAT_ID="
      echo "# CLOUDFLARE_TUNNEL_TOKEN=   # para ./lukwolfly.sh up --named"
    } > "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    printf '\n  %sSenha do painel /admin:%s %s\n  %s(guardada em .env — veja de novo com ./lukwolfly.sh senha)%s\n\n' "$c_lilac" "$c_off" "$pw" "$c_mute" "$c_off"
  fi
  [[ "$(env_value ADMIN_PASSWORD)" =~ ^.{6,}$ ]] || die "ADMIN_PASSWORD ausente ou curta (mín. 6) em $ENV_FILE."
  [[ "$(env_value SESSION_SECRET)" =~ ^.{16,}$ ]] || die "SESSION_SECRET ausente ou curto (mín. 16) em $ENV_FILE."
}

wait_healthy() {
  say "Aguardando o site ficar saudável…"
  local id status
  for _ in $(seq 1 90); do
    id="$("${COMPOSE[@]}" ps -q app 2>/dev/null || true)"
    if [[ -n "$id" ]]; then
      status="$(docker inspect -f '{{.State.Health.Status}}' "$id" 2>/dev/null || echo starting)"
      [[ "$status" == "healthy" ]] && { info "app: healthy"; return 0; }
      [[ "$status" == "unhealthy" ]] && { "${COMPOSE[@]}" logs --tail=40 app; die "O app ficou unhealthy."; }
    fi
    sleep 2
  done
  "${COMPOSE[@]}" logs --tail=40 app
  die "Tempo esgotado esperando o app."
}

quick_url() {
  "${COMPOSE[@]}" --profile quick logs tunnel 2>/dev/null \
    | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || true
}

wait_quick_url() {
  say "Abrindo túnel Cloudflare…" >&2
  local url=""
  for _ in $(seq 1 60); do
    url="$(quick_url)"
    [[ -n "$url" ]] && { echo "$url"; return 0; }
    sleep 2
  done
  "${COMPOSE[@]}" --profile quick logs --tail=30 tunnel >&2
  die "Não consegui obter a URL do túnel."
}

cmd_up() {
  local mode="quick" dev=0
  for arg in "$@"; do
    case "$arg" in
      --named) mode="named" ;;
      --local) mode="local" ;;
      --dev) dev=1 ;;
      *) die "Opção desconhecida: $arg" ;;
    esac
  done
  if (( dev )); then
    echo dev > "$MODE_FILE"
    COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.dev.yml)
    [[ -d node_modules ]] || die "Modo dev usa o node_modules local: rode 'npm install' antes."
  else
    rm -f "$MODE_FILE"
    COMPOSE=(docker compose)
  fi

  banner
  require_docker
  ensure_env

  if [[ "$mode" == "named" && -z "$(env_value CLOUDFLARE_TUNNEL_TOKEN)" ]]; then
    die "Defina CLOUDFLARE_TUNNEL_TOKEN em $ENV_FILE para usar --named."
  fi

  if (( dev )); then say "Subindo em modo DEV (hot reload) ($mode)"; else say "Build da imagem e subida dos containers ($mode)"; fi
  local profile=()
  [[ "$mode" != "local" ]] && profile=(--profile "$mode")
  # derruba túneis de outro modo para não ficarem dois rodando
  docker compose --profile quick --profile named down --remove-orphans >/dev/null 2>&1 || true
  if (( dev )); then
    LUK_PORT="$PORT" "${COMPOSE[@]}" "${profile[@]}" up -d
  else
    LUK_PORT="$PORT" "${COMPOSE[@]}" "${profile[@]}" up -d --build
  fi

  wait_healthy

  echo
  say "Local:   http://localhost:${PORT}"
  say "Painel:  http://localhost:${PORT}/admin"
  case "$mode" in
    quick)
      local url; url="$(wait_quick_url)"
      say "Público: ${url}"
      info "URL temporária: muda a cada subida do túnel (trycloudflare)."
      ;;
    named)
      say "Público: o hostname configurado no seu túnel nomeado da Cloudflare"
      ;;
    local) info "Sem túnel (modo --local)." ;;
  esac
  echo
  (( dev )) && info "Modo DEV: salve um arquivo e a página atualiza sozinha. Primeira carga pode levar ~30s."
  info "logs:  ./lukwolfly.sh logs      parar:  ./lukwolfly.sh down"
}

# Reconstrói e troca só o container do site. O cloudflared continua
# rodando, então a URL pública (trycloudflare) é preservada.
cmd_update() {
  require_docker
  if [[ -f "$MODE_FILE" ]]; then say "Modo DEV ativo: as mudanças já aparecem sozinhas, não precisa de update."; return; fi
  ensure_env
  say "Rebuild do site (túnel e dados preservados)"
  LUK_PORT="$PORT" "${COMPOSE[@]}" up -d --build --no-deps app
  wait_healthy
  local url; url="$(quick_url)"
  say "Local:   http://localhost:${PORT}"
  [[ -n "$url" ]] && say "Público: ${url} (mesma URL)"
}

cmd_url() {
  require_docker
  local url; url="$(quick_url)"
  [[ -n "$url" ]] && echo "$url" || die "Nenhum túnel rápido ativo."
}

cmd_senha() {
  [[ -f "$ENV_FILE" ]] || die "Ainda não existe $ENV_FILE — rode ./lukwolfly.sh up primeiro."
  echo "$(env_value ADMIN_PASSWORD)"
}

cmd_backup() {
  require_docker
  local id; id="$("${COMPOSE[@]}" ps -q app 2>/dev/null || true)"
  [[ -n "$id" ]] || die "O app não está rodando."
  mkdir -p backups
  local file="backups/lukwolfly-$(date +%Y%m%d-%H%M%S).tar.gz"
  docker exec "$id" node -e "const {DatabaseSync}=require('node:sqlite');new DatabaseSync('/data/lukwolfly.db').exec(\"VACUUM INTO '/tmp/backup.db'\")"
  docker exec "$id" sh -c 'cd / && tar czf - -C /tmp backup.db -C /data uploads' > "$file"
  docker exec "$id" rm -f /tmp/backup.db
  say "Backup salvo em $file"
}

cmd_logs() {
  require_docker
  "${COMPOSE[@]}" --profile quick --profile named logs -f --tail=100 "$@"
}

cmd_status() {
  require_docker
  "${COMPOSE[@]}" --profile quick --profile named ps
}

cmd_restart() {
  require_docker
  "${COMPOSE[@]}" --profile quick --profile named restart
  wait_healthy
  local url; url="$(quick_url)"
  [[ -n "$url" ]] && say "Público: $url (pode ter mudado)"
}

cmd_down() {
  require_docker
  say "Derrubando LUKWOLFLY (dados preservados no volume lukwolfly_lukwolfly-data)"
  "${COMPOSE[@]}" --profile quick --profile named down --remove-orphans
  rm -f "$MODE_FILE"
}

case "${1:-help}" in
  up)      shift; cmd_up "$@" ;;
  update)  cmd_update ;;
  url)     cmd_url ;;
  senha)   cmd_senha ;;
  backup)  cmd_backup ;;
  logs)    shift; cmd_logs "$@" ;;
  status)  cmd_status ;;
  restart) cmd_restart ;;
  down)    cmd_down ;;
  *)       sed -n '3,18p' "$0" | sed 's/^# \{0,1\}//' ;;
esac
