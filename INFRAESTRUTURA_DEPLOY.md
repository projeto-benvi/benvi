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
- Categorias: endpoint publico com cache curto em memoria por instancia; invalida em criacao/edicao/remocao.

## Railway MySQL

A conexao usa exclusivamente:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL`

Configuracao aplicada:

- Um pool reutilizavel por instancia serverless, preservado em `globalThis`.
- `mysql2/promise`.
- `connectionLimit: 5`; nao aumentar sem medir o limite do plano Railway e a concorrencia real.
- Timeout de conexao.
- SSL ativado somente com `DB_SSL=true`.
- `DB_HOST` validado como host puro, sem protocolo, credenciais, porta, database ou query string.
- Sem credenciais fixas no codigo.
- Migrations nao rodam no boot, build ou deploy.

Checklist Railway:

- Ativar backups automaticos.
- Confirmar se a URL escolhida exige SSL e definir `DB_SSL` corretamente.
- Usar banco na regiao mais proxima possivel da Vercel.
- Monitorar conexoes ativas, CPU, memoria e queries lentas.
- Considerar que cada instancia serverless pode manter ate cinco conexoes; o total potencial e `instancias simultaneas x 5`.
- Configurar alerta antes do limite do plano e reduzir concorrencia/instancias ou adotar proxy de conexoes se houver saturacao.
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
- Em `DB_HOST`, cadastrar somente o host do Railway MySQL; a porta fica em `DB_PORT`.
- Em Preview, `NEXTAUTH_URL` deve apontar para a URL exata do deployment testado.
- Se Google OAuth estiver ativo, cadastrar callbacks `https://SEU-PREVIEW.vercel.app/api/auth/callback/google` e `https://SEU-DOMINIO-FINAL/api/auth/callback/google`.
- Se Google OAuth nao estiver configurado, o provider fica desabilitado e o login por credenciais permanece ativo.

## Migrations

Comando manual:

```bash
npm run migrate
```

Atualizacao obrigatoria para Preview atual:

- Rodar as migrations `023_production_readiness_indexes` e `024_runtime_schema_guards_to_migrations` antes de validar Preview. Elas substituem ajustes de schema que antes eram tentados durante requests e criam indices importantes para reduzir latencia.
- Rodar tambem `025_admin_alerts_account_deletion` para habilitar auditoria admin, alertas em massa e exclusao logica de conta.

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
- Confirmar que `DB_HOST` contem apenas o host do Railway, sem URL completa.
- Garantir `NEXTAUTH_URL` correto para Preview/Production.
- Criar deploy Preview.
- Testar login, cadastro, perfil, busca, solicitacoes, servicos, mensagens, notificacoes e admin.
- Testar upload de avatar e imagens de servico.
- Confirmar que uploads retornam erro seguro quando Cloudinary nao estiver configurado.
- Confirmar que anexos privados retornam erro seguro.
- Confirmar que `/api/categoria` responde sem 500 e com latencia normal depois da primeira conexao fria.
- Confirmar que agenda, alertas, avaliacoes e tickets funcionam sem tentar criar ou alterar tabelas durante requests.
- Confirmar que o dashboard admin consegue promover/remover admins sem remover o ultimo administrador ativo.
- Confirmar que alertas internos em massa mostram estimativa e criam notificacoes para o publico correto.
- Confirmar que exclusao propria oculta perfil publico, encerra sessao e bloqueia novo login.
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
- Confirmar que criacao publica de usuario nao aceita `is_admin`, `nivel_acesso` ou `status_conta` do cliente.
- Confirmar que notificacoes por ID so podem ser acessadas pelo dono ou admin.
- Usar rota administrativa exclusiva para alterar `is_admin`; rotas comuns e edicao de perfil nao aceitam campos administrativos.
- Exclusao de conta e logica e rastreavel; nao usar delete fisico de usuario em producao.

## Politica tecnica de contas e alertas

- Administradores: promocoes/remocoes usam sessao server-side e registram `admin_auditoria` sem dados sensiveis.
- Alertas rapidos: envio interno em massa registra `alerta_envio` e cria notificacoes em lote para usuarios ativos.
- Limite serverless: envios com publico muito grande devem ser migrados para fila/worker antes de producao ampla.
- Exclusao propria: `usuario.status_conta='excluido'`, `deleted_at` preenchido, perfil publico oculto, prestador/servicos/agenda desativados.
- Dados preservados: mensagens, solicitacoes, avaliacoes e relacoes historicas continuam para integridade e auditoria.
- Esta politica e tecnica; nao substitui revisao juridica/LGPD.

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
- Implantar rate limiting persistente com Upstash/Vercel KV/servico equivalente antes de campanha publica.
