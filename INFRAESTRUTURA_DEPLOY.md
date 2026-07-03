# Infraestrutura e Deploy - Benvi

## Arquitetura atual

- Framework: Next.js 16.2.6 com App Router, React 19.2.4 e TypeScript.
- Frontend: telas em `app/`, componentes em `components/` e camada visual em `view/`.
- Backend: Route Handlers em `app/api/**/route.ts`, controllers em `controller/` e services em `service/`.
- Autenticacao: NextAuth v4 com Credentials e Google OAuth em `app/api/auth/[...nextauth]/route.ts`.
- Banco: MySQL via `mysql2/promise`, sem ORM.
- Schema: migrations TypeScript em `app/migrations/`, executadas por `instrumentation.ts` durante inicializacao.
- Upload: imagens de perfil gravadas em `public/uploads` usando filesystem local.
- Deploy alvo: Vercel, usando `npm run build`.

## Estado de producao

O projeto ainda nao esta pronto para publicar diretamente.

Bloqueios principais:

- `npm run build` falha no type check porque `app/api/conversas/[conversaId]/mensagens/route.ts` esta vazio e nao exporta handlers.
- `next.config.ts` usa `experimental.instrumentationHook`, opcao invalida no Next 16.
- `middleware.ts` esta depreciado no Next 16; a convencao recomendada e `proxy`.
- A conexao MySQL esta hardcoded em `app/lib/dataBase.ts`, incluindo host, usuario, senha e database.
- Quase todas as APIs nao validam sessao no servidor; muitas confiam em IDs enviados por query/body.
- Upload local em `public/uploads` nao persiste em ambiente serverless da Vercel.
- Migrations e alteracoes de schema rodam no boot/runtime, o que e arriscado em serverless.

## Checklist de deploy na Vercel

- Corrigir o build ate `npm run build` finalizar com sucesso.
- Remover `experimental.instrumentationHook` de `next.config.ts`.
- Migrar `middleware.ts` para a convencao `proxy` do Next 16 ou validar a compatibilidade atual antes do deploy.
- Configurar variaveis de ambiente no painel da Vercel.
- Trocar credenciais hardcoded por `process.env`.
- Definir `NEXTAUTH_URL` com a URL final de producao.
- Definir `AUTH_SECRET` ou `NEXTAUTH_SECRET` forte e unico para producao.
- Garantir que todas as rotas API que usam MySQL rodem em runtime Node.js, nao Edge.
- Remover migrations automaticas do boot e executar migrations em etapa controlada antes do deploy.
- Substituir upload local por storage externo.
- Validar todas as rotas administrativas com sessao real e permissao de admin.

Comando de build recomendado:

```bash
npm run build
```

Comando local de producao:

```bash
npm run start
```

`vercel.json`:

- Nao e obrigatorio para o deploy basico de Next.js na Vercel.
- Pode ser usado depois para limites de duracao, headers de seguranca ou redirects.
- Nao deve ser usado para tentar manter processos permanentes, workers ou WebSockets tradicionais.

## Variaveis de ambiente

Checklist minimo:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `AUTH_SECRET` ou `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`, se Google login estiver ativo
- `GOOGLE_CLIENT_SECRET`, se Google login estiver ativo
- Variaveis do storage de arquivos, quando substituir upload local

Cuidados:

- Nunca commitar `.env.local`, `.env.production` ou qualquer `.env*`.
- O `.gitignore` ja ignora `.env*`.
- Se algum segredo ja foi commitado historicamente, rotacionar o segredo no provedor.
- Variaveis sem `NEXT_PUBLIC_` ficam apenas no servidor. Nao usar `NEXT_PUBLIC_` para senhas, tokens ou credenciais.

## Configuracao recomendada do MySQL

Situacao atual:

- Usa `mysql2/promise`.
- Cria pool em `app/lib/dataBase.ts`.
- Credenciais estao fixas no codigo.
- Nao ha limite explicito de conexoes no pool.
- Nao ha SSL configurado.
- Migrations rodam no runtime.

Recomendacao para Vercel:

- Usar MySQL gerenciado com conexoes TLS, por exemplo PlanetScale, Railway, Aiven, AWS RDS, Google Cloud SQL ou DigitalOcean Managed MySQL.
- Para serverless, preferir provedor/driver com estrategia serverless ou proxy de conexao.
- Se mantiver `mysql2`, configurar `connectionLimit` baixo, `queueLimit`, timeouts e SSL.
- Evitar criar conexoes avulsas por request; manter o pool em modulo compartilhado.
- Nao rodar migrations automaticamente em cada cold start.

Exemplo de variaveis:

```text
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SSL=true
```

Indices recomendados:

- `usuario(email)` unico ja existe pelo schema.
- `usuario(cpf)` unico ja existe pelo schema.
- `usuario(cidade)`
- `usuario(status_conta)`
- `prestador(status_verificado, impulsiona_perfil)`
- `prestador(categoria_principal)`
- `tag(id_categoria, id_prestador)`
- `servico(id_prestador)`
- `servico(id_categoria, status_servico)`
- `solicitacaoservico(id_usuario, data_solicitacao)`
- `solicitacaoservico(id_prestador, status, data_solicitacao)`
- `agenda(id_prestador, horario_inicio, horario_fim)`
- `avaliacao(id_prestador, data_avaliacao)`
- `avaliacao(id_usuario, data_avaliacao)`
- `conversas(idUsuario, ultimaMensagemEm)`
- `conversas(idPrestador, ultimaMensagemEm)`
- `mensagens(idConversa, criadoEm)`
- `notificacao(id_usuario, visualizada, data_envio)`
- `favorito(id_usuario, id_prestador)` ja existe como unico.
- `ticketsuporte(id_usuario, data_atualizacao)`
- `ticketsuporte(status, data_atualizacao)`

Consultas com maior risco de gargalo:

- Busca/listagem de prestadores com joins, agregacoes, `GROUP_CONCAT`, avaliacoes e servicos.
- Listagem de servicos e prestadores sem paginacao consistente.
- Mensagens por conversa ordenadas por data.
- Notificacoes ordenadas por visualizacao e data.
- Dashboards administrativos com varios `COUNT(*)`.

## Upload de imagens e documentos

Situacao atual:

- Upload de foto grava em `public/uploads`.
- Usa `fs`, `writeFile`, `mkdir`, `unlinkSync`.
- Nao ha validacao forte de MIME type, tamanho, dimensoes ou extensao permitida.

Problema na Vercel:

- O filesystem de serverless functions e efemero.
- Arquivos gravados localmente podem sumir entre execucoes e nao sao compartilhados entre instancias.

Recomendacao:

- Usar Vercel Blob, S3, Cloudflare R2, Cloudinary ou similar.
- Validar tamanho maximo, MIME type real e extensoes.
- Gerar nomes aleatorios, nao derivados apenas de usuario/data.
- Salvar no banco apenas a URL/chave do arquivo.
- Considerar URLs assinadas para documentos privados.

## Autenticacao e autorizacao

Situacao atual:

- NextAuth usa JWT por 7 dias.
- Middleware protege algumas paginas, mas exclui `/api`.
- Rotas API geralmente nao chamam `getServerSession` ou `getToken`.
- Muitos endpoints usam `id_usuario`, `idUsuario`, `id_solicitante` ou `is_admin` enviados pelo cliente.
- Endpoints administrativos verificam admin consultando o banco pelo `id_solicitante`, mas esse ID vem da query string.

Riscos:

- Um usuario pode tentar consultar/alterar dados de outro usuario mudando IDs no request.
- Rotas administrativas podem ser atacadas se o atacante descobrir/forjar um ID de admin.
- Atualizacao de usuario aceita `is_admin` em payload/formData.
- APIs de favoritos, pedidos, mensagens, tickets e notificacoes precisam checar dono do recurso.

Recomendacao:

- Em toda API privada, obter usuario autenticado no servidor via NextAuth.
- Ignorar IDs de usuario enviados pelo cliente quando o recurso for do proprio usuario.
- Validar permissao por recurso: dono, prestador participante ou admin.
- Criar helpers centralizados: `requireUser`, `requireAdmin`, `requireResourceOwner`.
- Manter middleware/proxy para UX, mas tratar API como fronteira real de seguranca.

## Mensagens, notificacoes, pagamentos e jobs

Mensagens:

- Implementadas por tabelas `conversas` e `mensagens`.
- Nao ha WebSocket real detectado.
- Provavelmente funciona via polling/fetch.
- Para tempo real, usar Pusher, Ably, Supabase Realtime ou WebSocket fora da Vercel.

Notificacoes:

- Persistidas no MySQL.
- Criadas durante fluxos como solicitacao, agenda e tickets.
- Nao ha push/email/worker detectado.

Pagamentos:

- Existe entidade `assinaturaplano`.
- Nao foi detectada integracao real com gateway de pagamento.
- Antes de cobrar usuarios, integrar gateway, webhooks assinados e tabela de eventos.

Jobs agendados:

- Nao ha cron/worker real identificado.
- Se precisar expirar assinaturas, lembretes ou limpeza, usar Vercel Cron, GitHub Actions, fila gerenciada ou worker externo.

## Plano de backup

- Usar backup automatico do provedor MySQL.
- Definir retencao minima de 7 a 30 dias no lancamento.
- Fazer snapshot manual antes de cada deploy com migrations.
- Testar restauracao em banco de staging.
- Exportar schema e dados criticos antes de alteracoes estruturais.
- Para arquivos, usar storage com versionamento ou lifecycle policy.

## Monitoramento basico

- Vercel Analytics para trafego e Web Vitals.
- Logs da Vercel para erros de functions.
- Sentry ou similar para erros frontend/backend.
- Monitoramento do MySQL: conexoes ativas, queries lentas, CPU, memoria, storage.
- Alertas para erro 5xx, falha de login, falha de pagamento, falha de upload e saturacao de conexoes.
- Ativar slow query log no banco gerenciado.

## Checklist de seguranca

- Remover credenciais hardcoded do codigo.
- Rotacionar qualquer segredo que ja tenha ficado no repositorio.
- Proteger todas as APIs privadas com sessao e autorizacao.
- Remover capacidade de atualizar `is_admin` por endpoint comum.
- Validar body/query com schema, por exemplo Zod.
- Aplicar rate limit em login, cadastro, mensagens, upload e tickets.
- Validar upload por tamanho e tipo.
- Sanitizar mensagens e textos exibidos.
- Evitar retornar detalhes internos de erro em producao.
- Configurar headers de seguranca.
- Revisar CORS se APIs forem chamadas fora do mesmo dominio.
- Garantir TLS no MySQL.

## Plano de rollback

Antes do deploy:

- Criar snapshot do banco.
- Registrar commit/tag da versao atual.
- Validar build local e em preview da Vercel.
- Rodar migrations em staging.

Durante o deploy:

- Publicar primeiro em Preview.
- Testar login, cadastro, busca de prestadores, solicitacao, mensagens, upload e admin.
- Promover para Production somente apos checklist.

Se der problema:

- Reverter para o deployment anterior pelo painel da Vercel.
- Se houve migration destrutiva, restaurar snapshot ou executar migration de rollback planejada.
- Desabilitar temporariamente rotas problematicas via feature flag quando possivel.
- Conferir logs de erro e conexoes do banco antes de novo deploy.

## Plano de acao priorizado

### Fase 1 - Necessario antes de publicar

| Prioridade | Area/arquivo | Motivo | Risco de nao corrigir | Sugestao pratica |
|---|---|---|---|---|
| Critica | `app/api/conversas/[conversaId]/mensagens/route.ts` | Build falha porque a rota esta vazia | Deploy bloqueado | Exportar `GET`/`POST` validos ou remover a rota se nao for usada |
| Critica | `app/lib/dataBase.ts` | Credenciais MySQL hardcoded | Vazamento de segredo e impossibilidade de usar banco remoto | Usar `process.env`, SSL e limites de pool |
| Critica | APIs em `app/api/**` | Falta autorizacao server-side | Vazamento/alteracao de dados entre usuarios | Validar sessao e permissao em cada endpoint privado |
| Critica | `controller/usuarioController.ts` | Endpoint comum aceita `is_admin` | Escalada de privilegio | Bloquear campos administrativos fora de rota admin validada por sessao |
| Alta | `instrumentation.ts` e `app/migrations` | Migrations rodam no runtime | Cold start lento, disputa entre instancias e alteracao inesperada em producao | Executar migrations em etapa manual/CI antes do deploy |
| Alta | Upload em `public/uploads` | Filesystem serverless nao persiste | Fotos somem ou ficam inconsistentes | Migrar para Vercel Blob, S3, R2 ou Cloudinary |
| Alta | `next.config.ts` | Config experimental invalida | Warnings e risco de incompatibilidade | Remover `experimental.instrumentationHook` |
| Alta | `middleware.ts` | Convencao depreciada no Next 16 | Quebra futura e warnings | Migrar para `proxy` conforme docs locais do Next |
| Alta | Vercel env | Faltam `NEXTAUTH_URL` e DB vars | Login OAuth/callbacks e banco falham | Configurar variaveis por ambiente no painel Vercel |
| Media | `eslint.config.mjs` | Config nao e exportada | Lint analisa `.next` e falha inutilmente | Exportar a config corretamente e ignorar artefatos gerados |

### Fase 2 - Melhorias importantes logo apos o lancamento

| Prioridade | Area/arquivo | Motivo | Risco de nao corrigir | Sugestao pratica |
|---|---|---|---|---|
| Alta | MySQL | Serverless pode abrir conexoes demais | Erros `too many connections` | Usar pool limitado, provedor serverless/proxy ou pooler |
| Alta | Services de busca | Consultas com joins/agregacoes | Lentidao na busca de prestadores | Adicionar indices e paginacao |
| Alta | Login/cadastro/upload | Endpoints sensiveis | Brute force e abuso | Rate limit e validacao com schema |
| Media | Erros API | Algumas rotas retornam detalhes internos | Exposicao de informacao tecnica | Padronizar respostas e logs |
| Media | Notificacoes/mensagens | Sem tempo real confiavel | UX limitada | Manter polling com intervalo controlado ou usar serviço realtime |
| Media | Backups | Plano precisa ser operacionalizado | Perda de dados em incidente | Ativar backup automatico e testar restore |

### Fase 3 - Melhorias para escalar a plataforma

| Prioridade | Area/arquivo | Motivo | Risco de nao corrigir | Sugestao pratica |
|---|---|---|---|---|
| Alta | Banco/schema | Migrations proprias crescem em complexidade | Drift de schema | Considerar Prisma/Drizzle/Knex ou padronizar runner de migrations |
| Alta | Busca | Marketplace depende de descoberta | Busca lenta ou pouco relevante | Criar estrategia de ranking, filtros indexados e possivelmente search engine |
| Media | Pagamentos | Assinatura ainda nao tem gateway robusto | Cobrancas inconsistentes | Integrar gateway com webhooks assinados e idempotencia |
| Media | Observabilidade | Debug em producao fica dificil | MTTR alto | Sentry, tracing e metricas de banco |
| Media | Storage | Arquivos podem crescer | Custo/desorganizacao | Versionamento, lifecycle e thumbnails |
| Baixa | CI/CD | Deploy manual pode errar | Regressao por falta de checagem | Pipeline com build, lint, typecheck e smoke tests |
