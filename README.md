# Lukwolfly Atelier & Art

Site do ateliê: fursuits (sob consulta), artes digitais, pelúcias e acessórios,
com agenda pública de progresso, quadro estilo Trello da fila de desenhos e painel
admin. Next.js 16 + SQLite embutido (`node:sqlite`), tudo em **um container** +
túnel Cloudflare automático.

## Subir

```bash
./lukwolfly.sh up            # build + app + túnel rápido → imprime a URL *.trycloudflare.com
./lukwolfly.sh up --local    # só local (http://localhost:3000)
./lukwolfly.sh up --named    # túnel nomeado (CLOUDFLARE_TUNNEL_TOKEN no .env, domínio fixo)
./lukwolfly.sh up --dev      # hot reload (precisa de `npm install` antes)
./lukwolfly.sh update        # rebuild do site mantendo a mesma URL pública
./lukwolfly.sh senha         # mostra a senha do /admin
./lukwolfly.sh backup        # banco + uploads → ./backups/*.tar.gz
./lukwolfly.sh down          # para tudo (os dados ficam no volume)
```

Na 1ª execução o script cria o `.env` com **senha do admin** e segredo de sessão
aleatórios e mostra a senha no terminal.

## O que fica onde

| O quê | Como editar |
|---|---|
| Galeria (fursuits, artes, pelúcias, acessórios) | `/admin/galeria` — upload com otimização automática |
| Quadro de desenhos (Trello) | `/admin/quadro` — arrastar e soltar |
| Progresso de fursuits/pelúcias | `/admin/progresso` — clique na etapa |
| Vagas abertas/fechadas | `/admin/vagas` |
| Pedidos de orçamento | `/admin` (Pedidos) |
| Preços, textos, comparativo de pelos, @ do Telegram/Instagram | `src/content/site.ts` + `./lukwolfly.sh update` |
| Dados iniciais (seed) | `src/content/seed.ts` — usado só na 1ª subida |

> ⚠️ O seed vem com **exemplos** no quadro e no progresso (Neve, Kito, Ember…).
> Apague pelo `/admin` e cadastre as encomendas reais.

Os dados ficam no volume Docker `lukwolfly_lukwolfly-data` (`/data`): sobrevivem a
`update`, `down` e rebuilds. `docker compose down -v` apaga tudo.

## Pedidos → Telegram

Todo pedido é salvo no banco. Para receber aviso no Telegram também:
1. Crie um bot no @BotFather e coloque o token em `TELEGRAM_BOT_TOKEN` no `.env`.
2. Mande uma mensagem para o bot, abra `https://api.telegram.org/bot<TOKEN>/getUpdates`
   e copie o `chat.id` para `TELEGRAM_CHAT_ID`.
3. `./lukwolfly.sh restart`.

## Imagens de seed

Originais em `images/<categoria>/`. `npm run images` gera `public/media/*.webp` e o
manifesto `src/content/media.json` (colagens são recortadas — veja `SPLITS` em
`scripts/process-images.mjs`). Fotos novas: prefira o upload do `/admin`.

## Bot do Telegram

`telegram_bot/` é só o esqueleto (sem `__main__.py`). Ele lê `GET /api/public`
(vagas, progresso, quadro). Veja `telegram_bot/README.md`.

## Desenvolvimento

```bash
npm install
npm run dev        # http://localhost:3000 (dados em ./data)
npm run typecheck && npm run lint && npm test
```
