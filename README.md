# Borali · cadastro, reserva e avaliação de passeios

Sistema simples feito com **Next.js 15 (App Router)**, **Postgres** e a fonte **Poppins**, usando a identidade visual do Borali (turquesa + laranja). Pronto para deploy na **Vercel**.

## O que o sistema faz

**Turista**
- Criar conta e entrar (login)
- Ver os passeios, buscar por nome, lugar ou guia
- Reservar vagas em um passeio (e cancelar a reserva)
- Compartilhar o passeio (menu do celular, WhatsApp, e-mail ou copiar link)
- Avaliar o passeio e o guia (nota de 1 a 5 em cada um + comentário). Só quem reservou avalia, e pode editar a avaliação depois
- Atualizar o perfil e trocar a senha

**Guia**
- Criar conta de guia e entrar
- Cadastrar, editar e remover passeios
- Abrir e fechar as reservas de cada passeio ("passeio aberto")
- Ver quem reservou cada passeio e a nota recebida
- Atualizar o perfil e trocar a senha

> O pagamento **não** está integrado: a reserva é confirmada na hora e o valor é combinado diretamente com o guia.

## Rodar no seu computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem a variável `DATABASE_URL`, o sistema usa um banco **temporário em memória** (os dados somem quando você reinicia). É ótimo para testar.

Para usar um Postgres de verdade localmente, copie `.env.example` para `.env.local` e preencha `DATABASE_URL` e `AUTH_SECRET`.

## Deploy na Vercel (passo a passo)

1. **Suba o código para o GitHub** (crie um repositório e faça `git push`).
2. Na Vercel, clique em **Add New → Project** e importe o repositório. O framework (Next.js) é detectado sozinho.
3. **Adicione um banco Postgres** ao projeto: na aba **Storage** (ou **Marketplace**) escolha **Neon** e conecte ao projeto. A Vercel cria a variável `DATABASE_URL` automaticamente.
   - Se preferir outro Postgres (Supabase, Railway etc.), crie a variável `DATABASE_URL` com a string de conexão em **Settings → Environment Variables**.
4. **Crie a variável `AUTH_SECRET`** em **Settings → Environment Variables** com um valor longo e aleatório. Para gerar um:
   ```bash
   openssl rand -base64 32
   ```
5. Clique em **Deploy** (ou faça um novo deploy se as variáveis foram criadas depois do primeiro).

As tabelas são criadas automaticamente no primeiro acesso. Não precisa rodar migração.

> Sem `DATABASE_URL` na Vercel o sistema mostra erro de propósito, porque dados em memória não funcionam em ambiente serverless.

## Estrutura

```
app/                 páginas (home, login, cadastro, passeio, perfil, painel do guia)
app/api/             rotas da API (auth, perfil, passeios, reservas, avaliações)
components/          formulários, cartões de passeio, botões de ação, compartilhar
lib/                 banco (db.js, schema.js), login (auth.js), regras dos passeios (tours.js)
public/              logos do Borali
```

## Decisões e limites

- Login por cookie assinado (JWT, 7 dias) e senhas com bcrypt.
- Datas dos passeios são guardadas no horário local digitado e comparadas com o horário de Fortaleza (UTC-3).
- A checagem de vagas é feita no banco, mas sem trava de concorrência avançada: para um sistema pequeno é suficiente.
- Não há recuperação de senha por e-mail nem upload de fotos dos passeios (ideias para a próxima versão).
