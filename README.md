# MOMNT

Loja estática com API no Cloudflare Workers e catálogo armazenado no bucket
Cloudflare R2 `momnt-products`.

## Desenvolvimento

```bash
npm install
npm run dev
```

Crie um arquivo `.dev.vars` para desenvolvimento local:

```text
ADMIN_ACCESS_CODE=um-codigo-local-seguro
```

## Publicação

O Worker usa o binding R2 `PRODUCT_MEDIA`, configurado em `wrangler.jsonc`, e
serve as páginas geradas em `dist/`.

```bash
npx wrangler secret put ADMIN_ACCESS_CODE
npm run deploy
```

No primeiro acesso, o site usa o catálogo padrão incluído em
`assets/js/catalog-data.js`. O primeiro salvamento realizado pelo painel
administrativo cria `catalog/catalog.json` no R2. As imagens enviadas pelo
painel também continuam no mesmo bucket.
