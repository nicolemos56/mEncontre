# 🚀 Guia de Implantação do mEncontre — Vercel, Render e Railway

Este guia orienta você no processo passo a passo para colocar o **mEncontre** online e acessível para qualquer usuário, com destaque na **Vercel** e em plataformas ideais para servidores full-stack (como **Railway/Render**).

---

## ⚠️ Ponto Crítico: O Banco de Dados de Testes (`db.json`)

Atualmente, o mEncontre armazena os dados de novidades, usuários registrados, mensagens de chat e solicitações de match em um arquivo JSON local chamado `db.json`. 

*   **Na Vercel (Serverless):** O sistema de arquivos é **efêmero (estático e temporário)**. Isso significa que se você registrar um novo usuário ou enviar uma mensagem no chat, esses dados funcionarão por alguns minutos, mas desaparecerão sempre que a função serverless entrar em hibernação ou sofrer um cold start (reiniciado automático da Vercel).
*   **No Railway / Render (Servidor Contínuo):** O servidor Node.js roda de forma persistente. Alternativamente, você pode associar um Driver de Volume ou usar um Banco de Dados na nuvem (como Firestore ou Supabase) se desejar persistência permanente e segura.

Abaixo, veja como realizar cada tipo de deploy:

---

## ⚡ Opção 1: Deploy Completo na Vercel (Serverless)

Para implantar na Vercel unificando seu frontend em Vite/React e as APIs em Express na mesma infraestrutura, siga os passos descritos abaixo.

### 1. Criar o Arquivo de Configuração da Vercel (`vercel.json`)
Crie um arquivo chamado `vercel.json` na raiz do seu projeto com o seguinte conteúdo para mapear as requisições API (`/api/*`) para a nossa função serverless de backend e delegar o resto para o frontend estático:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 2. Criar a Função de Entrada para o Backend da Vercel
Crie uma pasta chamada `api/` na raiz do projeto e crie o arquivo `index.ts` dentro dela. Ele funcionará como a ponte serverless adaptando nosso Express:

```typescript
// api/index.ts
import express from 'express';
// Aqui importamos as rotas e regras do seu server.ts adaptadas para exportar o 'app' sem dar `.listen()` se executado sobre ambiente serverless.
```

### 3. Configurar as Variáveis de Ambiente na Vercel
Ao importar o projeto no Painel da Vercel, vá em **Project Settings > Environment Variables** e cadastre as suas chaves com os respectivos valores reais:
*   `GEMINI_API_KEY`: Sua chave de API do Google Gemini (necessária para calcular o Score IA do Matchmaker).
*   `FIRECRAWL_API_KEY`: Sua chave do Firecrawl (utilizada no Laboratório de Scraping ativo).

---

## 💎 Opção 2: Deploy no Railway ou Render (Recomendado para Full-Stack)

Plataformas baseadas em servidores contínuos como **Railway** ou **Render** são as mais indicadas para o mEncontre na sua arquitetura atual, pois mantêm o servidor Express de pé 24/7 e não sofrem com perdas de estado frequentes de dados em memória ou arquivo.

### 🖥️ Implantando no Render (Gratuito com limitações de boot rápido)
1.  Crie uma conta em [render.com](https://render.com) e conecte o seu repositório GitHub.
2.  Clique em **New + > Web Service**.
3.  Preencha as configurações básicas:
    *   **Runtime:** `Node`
    *   **Build Command:** `npm run build`
    *   **Start Command:** `npm start`
4.  Vá em **Advanced > Add Environment Variable** e adicione:
    *   `NODE_ENV`: `production`
    *   `GEMINI_API_KEY`: *sua_chave_gemini*
    *   `FIRECRAWL_API_KEY`: *sua_chave_firecrawl*
5.  Clique em **Deploy**! Em poucos minutos o seu app estará online num link seguro `https://seu-app.onrender.com`.

### 🦫 Implantando no Railway (Altamente veloz e prático)
1.  Acesse o [railway.app](https://railway.app), crie sua conta e clique em **New Project**.
2.  Selecione **Deploy from GitHub repo** e aponte para o repositório do seu app.
3.  O Railway irá ler seu `package.json` e detectar automaticamente os comandos `build` e `start`.
4.  Vá na aba **Variables** do serviço criado e insira as variáveis de ambiente:
    *   `GEMINI_API_KEY`
    *   `FIRECRAWL_API_KEY`
5.  Vá na aba **Settings** e clique em **Generate Domain** para gerar o seu link oficial público.

---

## 🛠️ Próximo Passo de Evolução: Migrando do `db.json` para o Firebase (Opcional)

Se você preferir continuar na Vercel aproveitando a CDN rápida e gratuita dele, o caminho perfeito para contornar a limitação de armazenamento efêmero do `db.json` é migrar os dados para o **Google Firebase Firestore** (banco NoSQL na nuvem gratuito e extremamente rápido).

Dessa forma, os perfis adicionados e chats serão gravados na nuvem e ficarão sempre salvos e integrados em tempo real na Vercel!
