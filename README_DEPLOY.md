# Deploy Benvi na Vercel

## Estado atual

O projeto esta preparado para build na Vercel depois da configuracao das variaveis de ambiente. O deploy automatico nao foi executado.

Comandos principais:

```bash
npm install
npm run build
npm run lint
npm run migrate
```

## Rodar localmente

1. Copie `.env.example` para `.env.local`.
2. Preencha as variaveis de banco e autenticacao.
3. Execute:

```bash
npm run dev
```

## Variaveis obrigatorias

Autenticacao:

- `NEXTAUTH_URL`
- `AUTH_SECRET` ou `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, se login Google estiver ativo
- `GOOGLE_CLIENT_SECRET`, se login Google estiver ativo

MySQL:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_CONNECTION_LIMIT`
- `DB_QUEUE_LIMIT`
- `DB_CONNECT_TIMEOUT_MS`
- `DB_SSL`
- `DB_SSL_REJECT_UNAUTHORIZED`
- `DB_SSL_CA`, se o provedor exigir CA

Storage:

- `STORAGE_PROVIDER`
- `STORAGE_PUBLIC_BASE_URL`
- `STORAGE_MAX_FILE_SIZE_MB`
- Variaveis especificas do provedor escolhido: Vercel Blob, Cloudinary, S3 ou R2.

## MySQL

A aplicacao usa `mysql2/promise` com pool compartilhado em `app/lib/dataBase.ts`.

Recomendacao inicial:

- MySQL gerenciado com TLS.
- `DB_CONNECTION_LIMIT=5` no inicio.
- Banco na mesma regiao ou proximo da Vercel.
- Backups automaticos ativos.
- Slow query log ativo.

Opcoes compativeis:

- PlanetScale
- Railway
- Aiven
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed MySQL

## Migrations

Migrations nao rodam mais no boot da aplicacao.

Execute manualmente em ambiente controlado:

```bash
npm run migrate
```

Fluxo recomendado:

1. Rodar migrations em staging.
2. Fazer backup/snapshot do banco de producao.
3. Rodar migrations em producao.
4. Fazer deploy na Vercel.

## Storage de arquivos

Uploads locais em `public/uploads` foram desativados para producao serverless.

Enquanto `STORAGE_PROVIDER` estiver vazio ou `disabled`, tentativas de upload retornam erro seguro informando que o storage nao esta configurado.

Escolha um provedor antes de publicar uploads reais:

- Vercel Blob
- Cloudinary
- S3
- Cloudflare R2

## Checklist Vercel

- Configurar todas as variaveis de ambiente.
- Rodar `npm run build`.
- Rodar `npm run lint`.
- Rodar `npm run migrate` contra o banco correto.
- Criar deploy Preview.
- Testar autenticação, cadastro, busca, perfil, pedidos, mensagens, notificações e painel admin.
- Promover para Production somente apos validação.

## Teste pos-deploy

- Login por credenciais.
- Login Google, se ativo.
- Cadastro de usuario.
- Criação/edição de prestador.
- Busca de prestadores/serviços.
- Solicitação de serviço.
- Mensagens entre cliente e prestador.
- Favoritos.
- Notificações.
- Rotas admin com usuario admin.
- Upload deve falhar com mensagem segura enquanto storage estiver desabilitado.

## Rollback

1. Reverter para o deployment anterior no painel da Vercel.
2. Se migration alterou schema/dados, restaurar snapshot ou executar rollback planejado.
3. Conferir logs da Vercel e metricas do banco.
4. Corrigir em branch separada e publicar novo Preview antes de promover.

## Pendencias de decisao

- Escolher provedor MySQL definitivo.
- Escolher provedor de storage.
- Decidir se mensagens devem continuar por polling ou evoluir para realtime externo.
- Integrar gateway real de pagamento antes de cobrar assinaturas.
