# 🚀 mEnContre — IA Matchmaker & Web Intelligence

Esta é a documentação técnica e de conceito do projeto **mEnContre** (ForgeMatch), estruturada com a jornada de desenvolvimento para submissão do projeto e detalhamento dos desafios superados.

---

## Inspiration

A faísca de inspiração para o nascimento do **mEnContre** surgiu de uma frustração dolorosamente comum vivida na pele: a tentativa exaustiva e ineficaz de formar equipes de desenvolvimento. 

Há algum tempo, decidimos participar de um hackathon global na plataforma **DevPost**. Com uma ótima ideia em mente, o passo necessário era encontrar parceiros com habilidades complementares. A estratégia foi a tradicional: buscar perfis recomendados no DevPost, segui-los e disparar dezenas de mensagens personalizadas no LinkedIn, convites por e-mail ou canais de contato disponíveis. O resultado, no entanto, foi desanimador: a taxa de resposta foi extremamente baixa. O silêncio imperava. E quando finalmente respondiam, o desalinhamento técnico era evidente — eles não possuíam as competências exatas exigidas para a nossa proposta, e nós não atendíamos aos requisitos que eles procuravam para o escopo deles.

Essa barreira expôs uma falha crítica no ecossistema: enquanto ideias extraordinárias e talentos sobram, pontes de comunicação direta e filtros granulares de compatibilidade semântica não existem em diretórios de perfil estáticos. 

O **mEnContre** nasceu precisamente para transformar esse cenário. Ao invés de forçar desenvolvedores a navegarem às cegas por feeds genéricos e redes saturadas, nós projetamos uma IA inteligente que entende as intenções de recrutamento em linguagem natural, vasculha a web em tempo real através de motores modernos de scraping (gerando o **Score IA** de afinidade mútua), valida a adequação técnica precisa e extrai canais de comunicação direta para que o convite ao candidato ideal aconteça de forma ativa, qualificada e amigável em um único clique.

---

## What it does

O **mEnContre** é um motor de matchmaking inteligente e orquestração de leads de engenharia que atua em três frentes principais:

1. **Smart Matching Baseado em Intenção:** O usuário descreve o seu projeto em linguagem natural (ex: *"Procuro um engenheiro da IIT Patna com conhecimentos em NLP e RAG para o Hackathon Build with Gemini"*). O sistema usa o modelo Gemini 3.5 para interpretar a intenção técnica e computar o **Score IA** de compatibilidade de 0 a 100%, justificando detalhadamente os motivos da afinidade.
2. **Integração de Métodos Ativos (Interno vs. Web):** Mescla a busca em bases de talentos registradas na plataforma com perfis extraídos em tempo real de plataformas externas de desenvolvimento e diretórios públicos como GitHub, Bebee e LinkedIn.
3. **Laboratório Firecrawl & Engenharia Reversa de Contatos:** Fornece um painel avançado onde o usuário pode raspar páginas de portfólio inteiras. A IA analisa o layout da página raspada, reconhece de forma estruturada cada pessoa, e permite realizar o **Rastreamento Profundo**. Esse rastreamento faz o scraping automático das subpáginas desses profissionais no BeBees ou GitHub para encontrar o link direto de envio de mensagem de chat, e-mail ou WhatsApp, vinculando esse link dinamicamente ao botão **"Demonstrar Interesse"** do ecossistema principal.

---

## How we built it

Construímos o **mEnContre** usando uma moderna arquitetura *fully reactive and secure full-stack*:

* **Frontend:** Implementado em **React 19** com **TypeScript** e empacotado pelo **Vite**. O design é governado pelo **Tailwind CSS**, priorizando contraste, legibilidade técnica e interfaces escuras imersivas. Usamos **Motion/React** para transparentar processos de IA de segundo plano através de fluxos de animação e layouts adaptativos.
* **Backend Autárquico:** Desenvolvemos um servidor em **Express** sob Node.js. Ele atua como um Proxy Server seguro que gerencia a base de dados em `db.json`, realiza a paginação e isola chaves de criptografia e tokens de API confidenciais do navegador.
* **Motores Cognitivos (IA):** Integramos a SDK oficial `@google/genai` utilizando o modelo **Gemini 3.5-flash** para computar similaridade semântica, parsear perfis a partir de páginas estruturadas e extrair links dinâmicos de subpáginas.
* **Rastreador Web:** Adotamos a API de alto poder de conversão de dados **Firecrawl** para extrair páginas completas, processando as requisições em formato Markdown otimizado para que a IA faça o mapeamento rápido dos dados de contato com alta acurácia.

---

## Challenges we ran into

Ao longo do desenvolvimento, enfrentamos quatro grandes adversidades técnicas:

* **Saturação de requisições e Limitações do Gemini (503):** O congestionamento de chamadas na nuvem às vezes causava falhas temporárias ao interpretar perfis muito longos. Resolvemos isso implementando o **ForgeMatch Local Scoring Engine**, um algoritmo fallback local inteligente que toma o controle de emergência sem travar a interface do usuário se a API do Gemini falhar.
* **Identificação de Meios de Contato Ocultos:** Plataformas de talentos como o BeBee usam layouts complexos e dinâmicos para esconder os links de chat interno ou redes de comunicação atrás de interações de cliente. Superamos isso desenvolvendo o **Dynamic Deep Profiler**, que instrui a IA do servidor a ler o código markdown específico do link da subpágina e identificar as rotas corretas de redirecionamento nativo das metatags.
* **Velocidade de Processamento das Páginas Web:** A conversão de páginas pesadas em dados utilizáveis em tempo real poderia causar gargalos graves de timeout. Mitigamos esse problema implementando limites flexíveis de leitura com tempos agressivos de execução paralela controlados por sinais de aborto da conexão (`AbortSignal.timeout`).

---

## Accomplishments that we're proud of

* **Mapeamento Prático Ponta-a-Ponta:** Conseguimos unificar um ecossistema onde de fato o botão "Demonstrar Interesse" deixa de ser uma representação estática e passa a se atrelar a links reais de comunicação direta (como WhatsApp, perfis reais do GitHub ou o link real de mensagem da plataforma minerada Bebee).
* **Robustez do Sistema de Fallbacks:** A segurança operacional de saber que o usuário nunca verá uma tela branca de erro, pois o backend se auto-recupera de falhas de chaves de API carregando mapeadores secundários com dados extraídos.
* **Performance de Construção:** Conseguimos projetar um servidor de build limpo que agrupa perfeitamente todo o servidor em formatos amigáveis para Node, livre de problemas com importações imperfeitas.

---

## What we learned

O desenvolvimento do mEnContre nos ensinou lições valiosas sobre o poder de unir **Agentes Cognitivos com Motores de Consulta Web em Tempo Real**. Aprendemos que os modelos de linguagem não devem apenas ler dados sintéticos de bases internas, mas quando integrados com ferramentas de extração inteligentes como o Firecrawl, eles se tornam capazes de interagir ativamente com a internet atual, mapear leads, realizar triagem curricular automatizada com precisão surpreendente e gerar valor instantâneo.

---

## What's next for mEnContre

O horizonte do **mEnContre** contempla grandes expansões:

1. **Sincronização Bidirecional com GitHub:** Realizar varreduras periódicas em novos repositórios criados por desenvolvedores recomendados para atualizar de maneira autônoma seus scoresIA em relação às tecnologias mais novas que eles estão produzindo.
2. **Suporte Multicanal Avançado:** Implementar notificações e abertura automática direta do chat de e-mail local (/mailto:) ou mensagens do LinkedIn com mensagens introdutórias personalizadas já traduzidas baseadas nas soft skills do candidato.
3. **Agente Autônomo de Convite:** Permitir que o usuário agende uma busca semanal onde a própria IA agenda, busca novos perfis e envia cartas de interesse personalizadas para os novos candidatos que ultrapassarem os 90% de Score IA de similaridade.
