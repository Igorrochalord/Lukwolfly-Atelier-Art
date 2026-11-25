"""Configuração do bot a partir de variáveis de ambiente."""

from __future__ import annotations

import os
from dataclasses import dataclass, field


def _ids(raw: str) -> frozenset[int]:
    return frozenset(int(x) for x in raw.replace(" ", "").split(",") if x)


@dataclass(frozen=True)
class Settings:
    token: str = field(default_factory=lambda: os.environ.get("TELEGRAM_BOT_TOKEN", ""))
    #: chats/usuários com permissão de admin (ids separados por vírgula)
    admin_ids: frozenset[int] = field(default_factory=lambda: _ids(os.environ.get("ADMIN_IDS", "")))
    #: URL do site visto de dentro do Docker
    site_api_url: str = field(default_factory=lambda: os.environ.get("SITE_API_URL", "http://app:3000"))
    #: URL pública do site (links nas mensagens)
    site_public_url: str = field(default_factory=lambda: os.environ.get("SITE_PUBLIC_URL", ""))
    data_dir: str = field(default_factory=lambda: os.environ.get("DATA_DIR", "/data"))

    def require(self) -> Settings:
        if not self.token:
            raise RuntimeError("TELEGRAM_BOT_TOKEN não definido")
        return self
