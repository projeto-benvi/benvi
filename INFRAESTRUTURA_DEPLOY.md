# Infraestrutura e Deploy - Benvi

## Arquitetura atual

- Framework: Next.js 16.2.6 com App Router, React 19.2.4 e TypeScript.
- Frontend: paginas em `app/`, componentes em `components/` e views em `view/`.
- Backend: Route Handlers em `app/api/**/route.ts`, controllers em `controller/` e services em `service/`.
- Autenticacao: NextAuth v4 com Credentials e Google OAuth.
- Banco: Railway MySQL via `mysql2/promise`, sem ORM.
- Schema: migrations TypeScript em `app/migrations/`.
- Upload publico: Cloudinary via `app/lib/storage.ts`.
- Upload privado: bloqueado ate existir storage privado.
- Deploy alvo: Vercel com `npm run build`.

## Railway MySQL

A conexao usa exclusivamente:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL`

Configuracao aplicada:

- Pool reutilizavel em modulo compartilhado.
- `mysql2/promise`.
- Limite baixo de conexoes.
- Timeout de conexao.
- SSL ativado somente com `DB_SSL=true`.
- Sem credenciais fixas no codigo.
- Migrations nao rodam no boot, build ou deploy.

Checklist Railway:

- Ativar backups automaticos.
- Confirmar se a URL escolhida exige SSL e definir `DB_SSL` corretamente.
- Usar banco na regiao mais proxima possivel da Vercel.
- Monitorar conexoes ativas, CPU, memoria e queries lentas.
- Criar snapshot antes de rodar migrations em producao.

## Cloudinary

Variaveis usadas exclusivamente:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Pastas configuradas:

- `benvi/avatars` para foto de perfil.
- `benvi/services` para imagens de servicos.
- `benvi/portfolio` reservada para portfolio quando o fluxo existir.

Regras de upload:

- Apenas imagens publicas.
- Tipos aceitos: JPG, JPEG, PNG e WEBP.
- Tamanho maximo: 5 MB por arquivo.
- Nome aleatorio gerado no servidor.
- Banco salva URL HTTPS e `publicId` quando necessario.
- Sem uso de `public/uploads` ou filesystem local em producao.

Documentos pessoais/sensiveis:

- RG, CPF, comprovante de residencia, PDFs privados e anexos sensiveis nao devem ir para Cloudinary.
- Rotas de reporte/ticket retornam erro seguro quando recebem anexo privado.
- Para liberar esse fluxo, implementar storage privado com URLs assinadas e controle de permissao.

## Checklist de variaveis de ambiente

App:

- `NEXTAUTH_URL`
- `AUTH_SECRET` ou `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, se Google estiver ativo
- `GOOGLE_CLIENT_SECRET`, se Google estiver ativo

Banco:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL`

Storage publico:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Cuidados:

- Nunca commitar `.env.local`, `.env.production` ou credenciais reais.
- Cadastrar variaveis separadamente em Preview e Production na Vercel.
- Usar secrets diferentes entre local, Preview e Production quando possivel.

## Migrations

Comando manual:

```bash
npm run migrate
```

Fluxo recomendado:

1. Validar se as migrations nao contem operacoes destrutivas.
2. Fazer backup/snapshot do Railway.
3. Rodar `npm run migrate` contra o banco correto.
4. Validar tabelas principais.
5. Fazer deploy Preview na Vercel.

## Checklist de deploy na Vercel

- Instalar dependencias com `npm install`.
- Rodar `npm run build`.
- Rodar `npm run lint`.
- Rodar ou validar `npm run migrate` em ambiente controlado.
- Cadastrar variaveis `DB_*`, `CLOUDINARY_*`, `NEXTAUTH_URL` e secrets.
- Garantir `NEXTAUTH_URL` correto para Preview/Production.
- Criar deploy Preview.
- Testar login, cadastro, perfil, busca, solicitacoes, servicos, mensagens, notificacoes e admin.
- Testar upload de avatar e imagens de servico.
- Confirmar que anexos privados retornam erro seguro.
- Promover para Production somente apos validação.

`vercel.json` nao e obrigatorio para o deploy basico. A Vercel detecta Next.js automaticamente.

## Processos nao compativeis com Vercel serverless

- Workers permanentes.
- WebSockets tradicionais mantidos dentro da propria aplicacao.
- Filas locais.
- Uploads em filesystem local.
- Migrations automaticas em cold start.

Para esses casos, usar servico externo: fila gerenciada, Vercel Cron, worker fora da Vercel, Pusher/Ably/Supabase Realtime ou storage dedicado.

## Plano de backup

- Backups automaticos do Railway habilitados.
- Snapshot manual antes de cada migration em producao.
- Retencao minima recomendada: 7 a 30 dias.
- Teste periodico de restore em banco de staging.
- Export do schema antes de mudancas estruturais.
- No Cloudinary, revisar backups/versionamento conforme plano contratado.

## Monitoramento basico

- Logs de Functions da Vercel.
- Vercel Analytics/Web Vitals, se habilitado.
- Alertas do Railway para conexoes, CPU, memoria e storage.
- Slow query log ou relatorio de queries lentas no MySQL.
- Sentry ou equivalente para erros frontend/backend.
- Alertas para falha de login, falha de upload, erro 5xx e saturacao de conexoes.

## Checklist de seguranca

- Sem credenciais hardcoded no codigo.
- `.env.local` fora do git.
- APIs privadas usando sessao server-side.
- IDs de usuario vindos do cliente nao definem identidade.
- Campos administrativos como `is_admin` bloqueados em rotas comuns.
- Upload validado por MIME type, extensao e tamanho.
- Documentos privados bloqueados ate existir storage privado.
- Respostas de erro sem senha, host, usuario ou stack trace.
- Backups ativos antes de Production.
- Revisar rate limit para login, cadastro, upload, mensagens e tickets.

## Plano de rollback

Antes do deploy:

- Criar snapshot do Railway.
- Registrar commit publicado.
- Validar build e Preview.

Se o deploy falhar:

1. Reverter para deployment anterior no painel da Vercel.
2. Se migrations foram executadas, restaurar snapshot ou aplicar rollback planejado.
3. Conferir logs da Vercel e metricas do Railway.
4. Corrigir em branch separada.
5. Publicar novo Preview antes de promover novamente.

## Pendencias conhecidas

- Confirmar `DB_SSL` ideal para a conexao Railway escolhida.
- Escolher/implementar storage privado para documentos pessoais/sensiveis.
- Definir estrategia realtime futura para mensagens, se necessario.
- Integrar gateway real de pagamento antes de cobrar assinaturas.
