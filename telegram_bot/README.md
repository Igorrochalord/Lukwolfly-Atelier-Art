# Bot do Telegram — Lukwolfly (esqueleto)

Pasta preparada para o bot. **Ainda não existe `main.py` / `__main__.py`** — a ideia
é escrever a lógica aqui quando o escopo estiver definido.

## Ideias
- **Avisar pedidos novos** — hoje o site já manda uma mensagem simples via
  `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`. O bot pode substituir isso com botões
  ("Responder", "Aceitar", "Recusar").
- **/vagas** — mostra vagas abertas (lê `GET /api/public` do site).
- **/fila** — mostra o quadro de desenhos e o progresso das fursuits/pelúcias.
- **Comandos da artista** — mover card no quadro, avançar etapa, abrir/fechar vagas
  (exigiria uma API autenticada no site; hoje essas ações são server actions do /admin).
- **Avisar o cliente** quando a encomenda dele mudar de etapa.

## Integração com o site
- API pública (somente leitura): `GET http://app:3000/api/public`
  → `{ slots, progress, board }`
- Dentro do Docker, use a rede `lukwolfly_default` (criada pelo `./lukwolfly.sh up`).

## Estrutura
```
telegram_bot/
├─ lukwolfly_bot/
│  ├─ __init__.py
│  └─ config.py        # leitura das variáveis de ambiente
├─ tests/
├─ Dockerfile          # CMD aponta para `python -m lukwolfly_bot` (crie o __main__.py)
├─ docker-compose.yml  # modo ao vivo com watchfiles
├─ requirements.txt
├─ requirements-dev.txt
├─ pyproject.toml
└─ .env.example
```

## Quando for rodar
1. Crie `lukwolfly_bot/__main__.py` com o ponto de entrada.
2. `cp .env.example .env` e preencha o token do @BotFather.
3. Com o site no ar: `docker compose up -d --build`.
