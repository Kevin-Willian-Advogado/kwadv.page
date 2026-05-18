# kwadv.page

Site institucional e blog juridico de Kevin Willian Advogado, construido com Angular e geracao estatica.

## Como o projeto funciona

O site usa Angular SSG para gerar HTML estatico no momento do build. Durante o build, a configuracao de servidor busca os artigos publicados no Supabase, normaliza os dados e prerenderiza as rotas publicas.

Depois do build, o navegador nao consulta o Supabase. Os dados necessarios para hidratacao sao lidos do `TransferState` ja embutido no HTML gerado.

Rotas prerenderizadas:

- `/`
- `/artigos`
- `/artigo/:slug`

## Arquitetura dos artigos

- `src/app/core/articles/articles.supabase.data-source.ts`: fonte de dados usada somente no build/prerender.
- `src/app/core/articles/articles.transfer-state.data-source.ts`: fonte de dados usada no navegador, lendo apenas o estado estatico do HTML.
- `src/app/core/articles/articles.service.ts`: API interna usada pelos resolvers, sem acoplamento direto ao Supabase.
- `src/app/app.routes.server.ts`: define as rotas estaticas e gera os slugs dos artigos no build.

## Requisitos

- Node.js 22
- npm

## Comandos

Instalar dependencias:

```bash
npm ci
```

Rodar em desenvolvimento:

```bash
npm start
```

Gerar o site estatico:

```bash
npm run build
```

A saida de producao fica em:

```text
dist/kwadv.page/browser
```

## Deploy

O deploy e feito pelo GitHub Pages via `.github/workflows/deploy-pages.yml`.

Ao fazer push na branch `main`, o workflow:

1. instala dependencias com `npm ci`;
2. executa `npm run build`;
3. publica `dist/kwadv.page/browser`.

O CMS tambem pode acionar esse workflow via `workflow_dispatch` para publicar ou remover um artigo. Os inputs usados sao:

- `article_id`
- `article_slug`
- `article_updated_at`
- `publication_action` (`publish` ou `unpublish`)
- `actor_id`

Quando chamado pelo CMS, o workflow espera o estado do artigo aparecer no Supabase, gera o site estatico, valida a rota `/artigo/:slug` e so entao finaliza o status do artigo. A finalizacao atualiza apenas linhas ainda em `status = 0`, evitando marcar como publicado um registro que ja saiu do estado de processamento.

O dominio configurado em `public/CNAME` e:

```text
kwadv.page
```

## Validacao estatica

Depois do build, estes pontos devem continuar verdadeiros:

- o Angular informa `Prerendered ... static routes`;
- `dist/kwadv.page/server` nao contem arquivos de servidor;
- o bundle do navegador nao contem URL, chave ou chamadas REST do Supabase;
- as paginas de artigo possuem HTML semantico ja renderizado.

Comandos uteis no PowerShell:

```powershell
(Get-ChildItem dist\kwadv.page\server -Recurse -Force | Measure-Object).Count
(Get-ChildItem dist\kwadv.page\browser -Recurse -Filter index.html | Measure-Object).Count
(Get-ChildItem dist\kwadv.page\browser -Recurse -Include *.js | Select-String -Pattern 'supabase','rest/v1','sb_publishable','fetch(' -SimpleMatch | Measure-Object).Count
```

## Atualizacao de conteudo

Para publicar novos artigos:

1. atualize os dados no Supabase pelo CMS;
2. publique ou remova o artigo pelo CMS para disparar o workflow;
3. valide o resultado em GitHub Actions e no GitHub Pages.

O conteudo novo so aparece no site apos um novo build.

Secrets esperados no repositorio:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
