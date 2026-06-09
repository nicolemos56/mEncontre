# ⚡ ForgeMatch — IA Matchmaker & Web Intelligence

> Encontre o par de desenvolvimento e co-fundadores ideais para seus projetos de software, produtos e hackathons através de inteligência artificial profunda, raspagem de dados web em tempo real e análise cognitiva.

ForgeMatch é uma plataforma full-stack moderna que simplifica a busca de parceiros de código. Ela conecta instantaneamente desenvolvedores locais cadastrados com perfis técnicos reais e ativos minerados diretamente da internet (via redes como GitHub, LinkedIn e Bebee), permitindo análise de afinidade técnica, cálculo de afinidade via IA (**Score IA**) e extração inteligente de meios de contato direto para networking ativo.

---

## 🎨 Principais Recursos

### 1. 🧠 Smart IA Matchmaker
* **Busca Semântica Avançada:** Digite solicitações complexas em linguagem natural (ex: *"Preciso de alguém experiente em NLP e RAG com diploma de mestrado para o hackathon da Gemini"*).
* **Cross-Sourcing:** Intercala perfis internos de desenvolvedores locais com resultados públicos reais minerados na web.
* **Algoritmo de Compatibilidade (Score IA):** Pontuação de afinidade de 0% a 100% gerada por análise cognitiva de competências de cada candidato em relação às exigências do seu projeto.
* **Demonstração de Interesse:** Registre suas tentativas de aproximação, envie mensagens personalizadas de boas-vindas e gerencie o histórico de respostas integrando meios de contato interativos de um clique (como links ou e-mails ativos).

### 2. 🧪 Laboratório Firecrawl & Sandbox de IA
A ferramenta possui uma central avançada de experimentos para minerar contatos em massa diretamente de páginas-alvo da web:
* **Scraping e Consulta em Tempo Real:** Converte páginas públicas completas em documentos markdown limpíssimos e otimizados para consumo de LLMs.
* **Detecção Cognitiva de Talentos:** Pede à IA para ler o layout completo de diretórios profissionais (como Bebee ou similares) e estruturar as competências técnicas, nomes, biografias e URLs de subperfis únicos.
* **Rastreamento Profundo & Disponibilidade:** Executa uma segunda varredura em segundo plano em subperfis individuais para decifrar links ocultos de canais de comunicação direta (como botões *"Enviar Mensagem"* ou links externos de portfólio) e os amarra instantaneamente ao botão "Demonstrar Interesse" no ecossistema central!

### 3. 👥 Diretório de Talentos Local
* Filtre devs locais ativos por habilidades técnicas específicas, cargo ou região.
* Acompanhe detalhes curriculares, biografia condensada e canais de acesso em uma interface de Cards limpa e responsiva.

---

## 🛠️ Tecnologias e Arquitetura

O sistema emprega uma arquitetura full-stack moderna dividida entre cliente e servidor, priorizando desempenho robusto, segurança de chaves corporativas e modularidade de componentes:

* **Frontend:** React 19, TypeScript, **Vite**, **Tailwind CSS** para design moderno e minimalista e **Motion** para transições, micro-animações visuais e estados de carregamento imersivos.
* **Backend:** Servidor customizado Express em Node.js suportando ESM e TypeScript nativos.
* **Motores de IA:** Integração oficial com a SDK [@google/genai](https://www.npmjs.com/package/@google/genai) executando o modelo ultrarrápido **Gemini 3.5-flash**.
* **Coleta Web:** Integração estruturada com a API **Firecrawl** para scraping instantâneo, consultas otimizadas e normalização de documentos em Markdown estruturado.

---

## ⚙️ Variáveis de Ambiente

Crie ou edite o arquivo `.env` (guie-se pelo `.env.example`) na raiz do seu projeto para fornecer as credenciais necessárias. O sistema opera de forma segura do lado do servidor (Server-Side Proxy) de forma a ocultar todas as chaves privadas do navegador:

```env
# .env.example
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

* **GEMINI_API_KEY:** Habilita o motor primário de cognição estruturada (Score IA, categorização, biografia aprofundada, análise contextual de perfil e mapeamento automatizado de termos técnicos).
  * *Fallback Inteligente:* Em caso de ausência ou saturação temporária (erro 503) do Gemini, o servidor ativará automaticamente o algoritmo proprietário **ForgeMatch Local Scoring Engine**, impossibilitando travamento ou interrupção do fluxo de trabalho do usuário.
* **FIRECRAWL_API_KEY:** Habilita a coleta de contatos web. (Uma chave padrão com limites de teste já vem nativamente embutida como reserva).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Certifique-se de possuir o **Node.js** (v18 ou superior) instalado em sua máquina.

### 1. Instalar as dependências
```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento
Executa o compilador em tempo real e inicializa o servidor Express na porta **3000** com recarregamento sob demanda:
```bash
npm run dev
```
Acesse o aplicativo abrindo `http://localhost:3000`.

### 3. Build de Produção
Para compilar o aplicativo de forma empacotada e ultraeficiente pronta para contêineres e produção:
```bash
npm run build
```
O script compilará a aplicação de interface estática do Vite, agrupará o backend TypeScript compilando em código CommonJS otimizado único em `dist/server.cjs` via **esbuild** (evitando travamento por importações relativas estritas na nuvem) e gerará os mapas de depuração em `dist/`.

### 4. Inicializar em Produção
```bash
npm run start
```

---

## 📂 Estrutura de Arquivos Principal

* `server.ts`: Ponto de entrada do backend. Hospeda APIs de autenticação, base local sincronizada (`db.json`), proxy do Firecrawl e deciframento cognitivo do Gemini.
* `src/App.tsx`: Orquestrador central da aplicação. Modula as abas de IA Matchmaker, Diretórios de Usuários, Laboratório Prático de Extração e o centro de configurações de usuário.
* `src/main.tsx` & `index.html`: Portais de entrada de montagem da árvore Single Page Application do React no navegador.
* `src/index.css`: Gerenciador de tema visual. Centraliza importações tipográficas (Inter, Space Grotesk, Fira Code) e regras de estilo do Tailwind CSS.
* `metadata.json`: Informações de registro de plataforma e capacidades integradas em contêineres Cloud Run.
