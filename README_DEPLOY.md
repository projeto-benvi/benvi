# Deploy Benvi na Vercel

## Estado atual

O projeto esta preparado para build na Vercel usando Railway MySQL e Cloudinary para imagens publicas. O deploy automatico nao foi executado.

Comandos principais:

```bash
npm install
npm run build
npm run lint
npm run migrate
```

## Rodar localmente

1. Copie `.env.example` para `.env.local`.
2. Preencha as variaveis reais de autenticacao, Railway MySQL e Cloudinary.
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

Railway MySQL:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL`

`DB_HOST` deve conter somente o host do Railway MySQL. Nao cole URL completa, protocolo `mysql://`, usuario, senha, porta, nome do banco ou query string nesse campo.

Cloudinary:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Railway MySQL

A aplicacao usa `mysql2/promise` com pool compartilhado em `app/lib/dataBase.ts`.

Configuracao recomendada:

- Criar o MySQL no Railway.
- Copiar host, porta, usuario, senha e database para as variaveis `DB_*`.
- Em `DB_HOST`, usar somente o host exibido pelo Railway; a porta fica exclusivamente em `DB_PORT`.
- Usar `DB_SSL=true` somente se a conexao Railway escolhida exigir SSL.
- Manter `connectionLimit: 5` e um unico pool por instancia serverless.
- Dimensionar o limite do Railway considerando que varias instancias podem multiplicar o total de conexoes (`instancias x 5`).
- Rodar migrations manualmente antes de promover deploy para producao.

## Migrations

Migrations nao rodam no boot, build ou deploy automaticamente.

Execute manualmente em ambiente controlado:

```bash
npm run migrate
```

Migrations mais recentes:

- `023_production_readiness_indexes`: adiciona colunas de compatibilidade usadas pelos services e indices para categorias, prestadores, servicos, solicitacoes, conversas, mensagens, notificacoes, avaliacoes e tickets.
- `024_runtime_schema_guards_to_migrations`: move ajustes restantes de schema de agenda, alertas, avaliacoes e tickets para migration manual, incluindo `ticketsuporte_interacao`.
- `025_admin_alerts_account_deletion`: adiciona auditoria administrativa, rastreio de alertas em massa e colunas de exclusao logica de conta.

## Politica tecnica de exclusao de conta

- A exclusao propria usa `DELETE /api/usuario/me` e identifica o usuario pela sessao server-side.
- Nao ha delete fisico cego de usuario.
- A conta recebe `status_conta='excluido'`, `deleted_at`, `deleted_by_user` e motivo tecnico.
- Perfil de prestador, servicos ativos e agenda futura sao ocultados/desativados.
- Foto publica deixa de ser exibida no perfil; remocao fisica no Cloudinary exige `public_id` rastreavel por fluxo.
- Mensagens, solicitacoes, avaliacoes e registros relacionados permanecem para integridade, disputas, auditoria e obrigacoes futuras.
- O ultimo administrador ativo nao pode excluir a propria conta.
- Conta Google/OAuth sem senha local usa sessao autenticada e frase `EXCLUIR MINHA CONTA` como confirmacao forte nesta etapa.

## Alertas internos em massa

- O envio em massa usa apenas notificacoes internas, sem e-mail, WhatsApp ou push.
- Publicos suportados: todos os usuarios ativos, clientes ativos e prestadores ativos.
- O envio imediato tem limite seguro para evitar timeout em serverless; volumes maiores devem usar fila/worker.
- Cada envio registra admin responsavel, publico, tipo, total de destinatarios e data.

Fluxo recomendado:

1. Rodar migrations em Preview/staging quando houver banco de teste.
2. Fazer backup/snapshot do banco de producao.
3. Rodar `npm run migrate` contra o banco Railway correto.
4. Fazer deploy Preview na Vercel.
5. Validar e promover para Production.

## Cloudinary

O Cloudinary esta configurado apenas para imagens publicas:

- Foto de perfil: `benvi/avatars`
- Imagens de servicos: `benvi/services`
- Imagens de portfolio: pasta reservada `benvi/portfolio`, caso o fluxo seja criado

Validações aplicadas:

- Apenas imagens `jpg`, `jpeg`, `png` e `webp`.
- Tamanho maximo de 5 MB por arquivo.
- Nome aleatorio gerado no servidor.
- MySQL salva URL segura e `publicId` quando o fluxo precisa rastrear o arquivo.

Documentos pessoais ou sensiveis, como RG, CPF, comprovante de residencia e anexos privados, nao sao enviados ao Cloudinary. Esses fluxos retornam erro seguro ate existir storage privado.

## Testar upload localmente

1. Preencha as tres variaveis `CLOUDINARY_*` no `.env.local`.
2. Rode `npm run dev`.
3. Teste foto de perfil.
4. Teste criacao de servico com ate 5 imagens.
5. Confirme no Cloudinary as pastas `benvi/avatars` e `benvi/services`.
6. Confirme no banco se a URL HTTPS foi salva.

## Configurar variaveis na Vercel

No painel da Vercel, configure as mesmas variaveis de `.env.example` nos ambientes Preview e Production. Use valores reais apenas no painel da Vercel e no `.env.local`, nunca no repositorio.

Para Preview, defina `NEXTAUTH_URL` com a URL exata do deployment Preview que sera testado. Para Production, troque para o dominio final. Cookies seguros sao aplicados pelo NextAuth em HTTPS.

Se Google OAuth estiver ativo, cadastre no Google Cloud os callbacks do NextAuth:

- `https://SEU-PREVIEW.vercel.app/api/auth/callback/google`
- `https://SEU-DOMINIO-FINAL/api/auth/callback/google`

Se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` nao forem configurados, o provider Google fica desabilitado e o login por credenciais continua disponivel.

## Checklist de deploy Preview

- `npm run build` passa localmente.
- `npm run lint` passa ou possui apenas avisos aceitos.
- `npm run migrate` foi validado contra o banco correto, sem rodar automaticamente em build, boot ou deploy.
- Variaveis `DB_*`, `CLOUDINARY_*`, `NEXTAUTH_URL` e secrets foram cadastradas na Vercel.
- `DB_HOST` contem apenas o host do Railway, sem URL completa.
- Login por credenciais funciona.
- Login Google funciona, se ativo.
- Cadastro e edicao de perfil funcionam.
- Upload de avatar funciona.
- Se Cloudinary nao estiver configurado, upload retorna erro seguro e paginas continuam carregando.
- Criacao de servico com imagens funciona.
- Documentos privados retornam erro seguro.
- Busca, solicitacoes, mensagens, notificacoes e admin foram testados.
- `/api/categoria` responde sem executar DDL em runtime; categorias usam cache publico curto por instancia.
- Services nao devem criar ou alterar tabelas durante requests; qualquer ajuste de schema deve entrar em nova migration e ser executado manualmente.
- Rotas administrativas de permissao e alertas foram testadas com sessao server-side.
- Exclusao propria desativa a conta e encerra a sessao, sem deletar fisicamente dados relacionais.

## Rollback

1. Reverter para o deployment anterior no painel da Vercel.
2. Se migrations foram executadas, restaurar snapshot do Railway ou aplicar rollback planejado.
3. Conferir logs da Vercel e metricas do Railway.
4. Corrigir em branch separada e publicar novo Preview antes de promover.

## Pendencias antes de Production

- Confirmar `DB_SSL` correto para a conexao Railway usada.
- Configurar backups automaticos no Railway.
- Definir storage privado futuro para documentos pessoais/sensiveis.
- Integrar gateway real de pagamento antes de cobrar usuarios.
- Definir rate limit externo para login, cadastro, uploads, mensagens e tickets antes de trafego alto.
