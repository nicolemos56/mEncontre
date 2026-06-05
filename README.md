
# mEncontre — IA Matchmaker & Web Intelligence

**mEncontre** é uma plataforma de inteligência coletiva e recrutamento técnico projetada para hackathons e incubadoras. O sistema utiliza Inteligência Artificial e automação web para conectar desenvolvedores a projetos através de análise semântica de competências, eliminando a fricção na formação de squads de alta performance.

Ao contrário de diretórios estáticos, o **mEncontre** minera dados em tempo real para validar a afinidade técnica entre membros, calculando um "Score de Compatibilidade" baseado em dados reais do GitHub, LinkedIn e outras redes profissionais.

---

##  Principais Recursos

### 1.  Smart IA Matchmaker (O Coração do Sistema)
O motor de busca não depende apenas de palavras-chave simples; ele utiliza processamento de linguagem natural para entender contextos complexos:
*   **Busca Semântica:** Permite consultas como: *"Procuro um desenvolvedor Mobile com foco em segurança que já tenha trabalhado com APIs de pagamento"*.
*   **AI Compatibility Score:** Um algoritmo proprietário analisa o perfil do candidato versus os requisitos do projeto, gerando uma pontuação de 0 a 100%.
*   **Gestão de Networking:** Interface integrada para demonstrar interesse, enviar mensagens de boas-vindas e gerenciar o histórico de interações com potenciais parceiros.

### 2.  Laboratório de Mineração (Firecrawl & IA Sandbox)
Uma central avançada para expansão da base de talentos através de inteligência web:
*   **Scraping Otimizado para LLM:** Integração com Firecrawl para converter páginas web complexas em Markdown limpo, pronto para processamento por IA.
*   **Estruturação Cognitiva:** A IA identifica automaticamente competências, nomes, biografias e URLs de portfólio dentro de diretórios profissionais públicos.
*   **Deep Crawling de Contato:** Varredura inteligente de subperfis para extração de canais de comunicação (como links de portfólio ou redes sociais), facilitando o networking direto.

### 3.  Diretório de Talentos Local
Uma visão organizada dos desenvolvedores já cadastrados no ecossistema:
*   **Filtros Avançados:** Segmentação por stack tecnológica, região ou nível de experiência.
*   **Interface Responsiva:** Cards intuitivos desenvolvidos com **React Motion** para uma experiência de usuário fluida e moderna.

---

##  Tecnologias e Arquitetura

O mEncontre utiliza uma arquitetura Full-Stack modularizada, garantindo que operações pesadas de IA e Scraping sejam processadas com segurança no lado do servidor.

### **Frontend**
*   **Core:** React 19 + TypeScript.
*   **Build Tool:** Vite (Ultra-fast development).
*   **Styling:** Tailwind CSS (Design System Minimalista).
*   **Animations:** Framer Motion (Transições imersivas e estados de carregamento).

### **Backend (Server-Side Proxy)**
*   **Runtime:** Node.js com Express (Suporte nativo a ESM/TypeScript).
*   **AI Engine:** Google Gemini 1.5 Flash (Performance de baixa latência para análise de dados).
*   **Web Extraction:** Firecrawl API (Normalização de dados estruturados).

---

##  Configuração do Ambiente

O sistema utiliza um **Server-Side Proxy** para proteger suas chaves de API. Nunca exponha seu arquivo `.env` publicamente.

Crie um arquivo `.env` na raiz do projeto seguindo este modelo:

```env
# Configurações do Servidor
PORT=3001

# Google Gemini AI
# Obtenha em: https://aistudio.google.com/
GEMINI_API_KEY=sua_chave_aqui

# Firecrawl (Web Scraping)
# Obtenha em: https://www.firecrawl.dev/
FIRECRAWL_API_KEY=sua_chave_aqui

# URL do Frontend (Para proteção de CORS)
FRONTEND_URL=http://localhost:5173
```

---

##  Como Executar

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/m-encontre.git
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

---
DDD-tech
