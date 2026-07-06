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

Cloudinary:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Railway MySQL

A aplicacao usa `mysql2/promise` com pool compartilhado em `app/lib/dataBase.ts`.

Configuracao recomendada:

- Criar o MySQL no Railway.
- Copiar host, porta, usuario, senha e database para as variaveis `DB_*`.
- Usar `DB_SSL=true` somente se a conexao Railway escolhida exigir SSL.
- Manter limite baixo de conexoes no pool da aplicacao.
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

## Checklist de deploy Preview

- `npm run build` passa localmente.
- `npm run lint` passa ou possui apenas avisos aceitos.
- `npm run migrate` foi validado contra o banco correto.
- Variaveis `DB_*`, `CLOUDINARY_*`, `NEXTAUTH_URL` e secrets foram cadastradas na Vercel.
- Login por credenciais funciona.
- Login Google funciona, se ativo.
- Cadastro e edicao de perfil funcionam.
- Upload de avatar funciona.
- Criacao de servico com imagens funciona.
- Documentos privados retornam erro seguro.
- Busca, solicitacoes, mensagens, notificacoes e admin foram testados.
- `/api/categoria` responde sem executar DDL em runtime; categorias usam cache publico curto por instancia.
- Services nao devem criar ou alterar tabelas durante requests; qualquer ajuste de schema deve entrar em nova migration e ser executado manualmente.

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
