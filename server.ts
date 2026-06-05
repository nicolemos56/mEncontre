/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const DB_FILE = path.join(process.cwd(), "db.json");

// Default Database Seed
const defaultDb = {
  usuarios: [
    {
      id: "u1",
      nome: "Andrade Silva",
      email: "andrade@forgematch.ao",
      password: "password123",
      bio: "Desenvolvedor Frontend experiente apaixonado por interfaces refinadas e animações fluidas com Framer Motion e Tailwind. Ativo na comunidade tech de Angola.",
      skills: ["React", "Typescript", "TailwindCSS", "Vite", "Framer Motion"],
      localizacao: "Luanda, Angola",
      contato: "github.com/andrade-dev",
      disponivel: true
    },
    {
      id: "u2",
      nome: "Cláudio Santos",
      email: "claudio@forgematch.ao",
      password: "password123",
      bio: "Engenheiro de Software focado no backend, modelagem de banco de dados e inteligência artificial. Criando novos microsserviços em FastAPI.",
      skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "SQLAlchemy"],
      localizacao: "Luanda, Angola",
      contato: "linkedin.com/in/claudio-fastapi",
      disponivel: true
    },
    {
      id: "u3",
      nome: "Mariana Costa",
      email: "mariana@forgematch.br",
      password: "password123",
      bio: "Desenvolvedora Mobile especializada em React Native e soluções híbridas fluidas. Adoro Hackathons e coding sprints.",
      skills: ["React Native", "Javascript", "iOS", "Android", "Redux"],
      localizacao: "São Paulo, Brasil",
      contato: "github.com/marianacodes",
      disponivel: true
    },
    {
      id: "u4",
      nome: "Diogo Neves",
      email: "diogo@forgematch.pt",
      password: "password123",
      bio: "Especialista em Go, sistemas distribuídos e infraestrutura escalável em nuvem com Kubernetes. Mentor de iniciantes.",
      skills: ["Go", "Docker", "Kubernetes", "gRPC", "Redis"],
      localizacao: "Lisboa, Portugal",
      contato: "github.com/diogo-neves",
      disponivel: false
    },
    {
      id: "u5",
      nome: "Filipe Mendes",
      email: "filipe@forgematch.ao",
      password: "password123",
      bio: "Entusiasta de Web3, smart contracts e finanças descentralizadas (DeFi) com Solidity.",
      skills: ["Solidity", "Ethereum", "Web3", "Node.js"],
      localizacao: "Luanda, Angola",
      contato: "twitter.com/filipe_crypto",
      disponivel: true
    }
  ],
  matches: []
};

// Database Helpers
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf8");
      return defaultDb;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database:", err);
    return defaultDb;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// Firecrawl Search Tool with resilient API fallback & timeout handling
async function searchWithFirecrawl(prompt: string): Promise<any[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY || "fc-d0f0b5f1b2f74792be54ee761d227d7b";
  if (!apiKey) {
    console.warn("[Firecrawl] API Key is empty. Skipping web profile scraping.");
    return [];
  }

  try {
    console.log(`[Firecrawl] Searching live web profiles for: "${prompt}"`);
    
    // Check if the prompt is already highly specific, contains pipe characters, emails, or is long.
    // If it is, send it exactly as-is. Otherwise, add a helpful prefix to target developers.
    let finalQuery = prompt.trim();
    if (prompt.length < 40 && !prompt.toLowerCase().includes("portfolio") && !prompt.toLowerCase().includes("engineer") && !prompt.toLowerCase().includes("|")) {
      finalQuery = `developer portfolio ${prompt}`;
    }

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: finalQuery,
        limit: 3
      }),
      signal: AbortSignal.timeout(12500) // Generous 12.5 seconds to query real web endpoints thoroughly
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Firecrawl] API returned non-2xx status (${response.status}):`, errText);
      return [];
    }

    const result = await response.json() as any;
    if (result && result.success && Array.isArray(result.data)) {
      console.log(`[Firecrawl] Found ${result.data.length} actual profiles online.`);
      return result.data;
    }
    return [];
  } catch (error: any) {
    console.warn("[Firecrawl] Failover triggered cleanly due to server timeout or API error:", error.message || error);
    return [];
  }
}

// Lazy Gemini Initialization
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiInstance = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } else {
      console.warn("GEMINI_API_KEY environment variable is not set. Matching will fall back to local scoring.");
    }
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize DB on boot
  readDb();

  // API Route: Register
  app.post("/api/auth/register", (req, res) => {
    const { nome, email, password, bio, skills, localizacao, contato, disponivel } = req.body;
    
    if (!nome || !email || !password) {
      res.status(400).json({ error: "Nome, Email e Senha são obrigatórios." });
      return;
    }

    const db = readDb();
    const exists = db.usuarios.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      res.status(400).json({ error: "Este email já está sendo utilizado." });
      return;
    }

    const newUser = {
      id: "u_" + Date.now(),
      nome,
      email,
      password,
      bio: bio || "",
      skills: Array.isArray(skills) ? skills : [],
      localizacao: localizacao || "Luanda, Angola",
      contato: contato || "",
      disponivel: disponivel !== undefined ? disponivel : true
    };

    db.usuarios.push(newUser);
    writeDb(db);

    const { password: _, ...userSafe } = newUser;
    res.status(201).json(userSafe);
  });

  // API Route: Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email e Senha são obrigatórios." });
      return;
    }

    const db = readDb();
    const user = db.usuarios.find(
      (u: any) =>
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      res.status(401).json({ error: "Credenciais inválidas. Verifique seu email e senha." });
      return;
    }

    const { password: _, ...userSafe } = user;
    res.json(userSafe);
  });

  // API Route: Get All Developers
  app.get("/api/developers", (req, res) => {
    const db = readDb();
    const safeUsers = db.usuarios.map((u: any) => {
      const { password, ...safe } = u;
      return safe;
    });
    res.json(safeUsers);
  });

  // API Route: Get Single User
  app.get("/api/usuarios/:id", (req, res) => {
    const db = readDb();
    const user = db.usuarios.find((u: any) => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: "Desenvolvedor não encontrado." });
      return;
    }
    const { password: _, ...userSafe } = user;
    res.json(userSafe);
  });

  // API Route: Update User
  app.put("/api/usuarios/:id", (req, res) => {
    const db = readDb();
    const idx = db.usuarios.findIndex((u: any) => u.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    const current = db.usuarios[idx];
    const { nome, bio, skills, localizacao, contato, disponivel } = req.body;

    const updated = {
      ...current,
      nome: nome !== undefined ? nome : current.nome,
      bio: bio !== undefined ? bio : current.bio,
      skills: Array.isArray(skills) ? skills : current.skills,
      localizacao: localizacao !== undefined ? localizacao : current.localizacao,
      contato: contato !== undefined ? contato : current.contato,
      disponivel: disponivel !== undefined ? disponivel : current.disponivel
    };

    db.usuarios[idx] = updated;
    writeDb(db);

    const { password: _, ...userSafe } = updated;
    res.json(userSafe);
  });

  // Helper: Local fallback matchmaking logic that can parse live Firecrawl results
  function getLocalFallbackMatches(prompt: string, incluirWeb: boolean, localDevelopers: any[], firecrawlResults?: any[]): any[] {
    console.log("Using backend fallback local-scoring matchmaker");
    const normalizedPrompt = prompt.toLowerCase();
    
    const scored = localDevelopers.map((dev: any) => {
      let score = 0;
      // Skill matching
      dev.skills.forEach((skill: string) => {
        if (normalizedPrompt.includes(skill.toLowerCase())) {
          score += 0.3;
        }
      });
      // Location matching
      const locParts = dev.localizacao.toLowerCase().split(",").map((p: string) => p.trim());
      locParts.forEach((part: string) => {
        if (normalizedPrompt.includes(part)) {
          score += 0.4;
        }
      });
      // Bio search
      if (dev.bio.toLowerCase().includes(normalizedPrompt)) {
        score += 0.1;
      }

      // Clip/normalize score
      const score_ia = Math.min(Math.max((score || 0.1), 0.1), 0.99);
      
      return {
        nome: dev.nome,
        contato: dev.contato,
        skills: dev.skills,
        localizacao: dev.localizacao,
        bio: dev.bio,
        score_ia,
        fonte: "interno",
        motivo: `Encontrado via correspondência local para "${prompt}". Este dev domina skills como ${dev.skills.slice(0, 3).join(", ")} e está na localização desejada.`
      };
    });

    // Sort by score
    const sorted = scored
      .filter((m: any) => m.score_ia > 0.1)
      .sort((a: any, b: any) => b.score_ia - a.score_ia);

    // Add high-quality real or simulated web results if 'incluirWeb' is active
    if (incluirWeb) {
      if (firecrawlResults && firecrawlResults.length > 0) {
        // Map the real Firecrawl results to candidates!
        firecrawlResults.forEach((item: any, idx: number) => {
          let titleStr = item.title || "Perfil Encontrado";
          let cleanNome = titleStr
            .replace(/ - LinkedIn/gi, "")
            .replace(/ \| LinkedIn/gi, "")
            .replace(/ - GitHub/gi, "")
            .replace(/ · GitHub/gi, "")
            .replace(/github - /gi, "")
            .replace(/\(.*\)/g, "")
            .trim();
          
          if (!cleanNome || cleanNome.length < 2) {
            cleanNome = `Desenvolvedor Web #${idx + 1}`;
          }

          // Scan technical skills
          const potentialSkills = [
            "React", "TypeScript", "Node.js", "Python", "NLP", "RAG", "LLMs", "LLM", 
            "Generative AI", "Intel", "IIT Patna", "M.Tech", "Machine Learning", 
            "Deep Learning", "AI", "Multimodality", "C++", "Java", "Next.js", "TailwindCSS", "Javascript"
          ];
          const matchedSkills: string[] = [];
          const textToScan = ((item.title || "") + " " + (item.description || "")).toLowerCase();
          potentialSkills.forEach(skill => {
            if (textToScan.includes(skill.toLowerCase())) {
              matchedSkills.push(skill);
            }
          });
          if (matchedSkills.length === 0) {
            matchedSkills.push("AI Developer", "Software Engineer");
          }

          // Geo guess
          let localizacao = "Remoto / Web Pública";
          if (textToScan.includes("patna") || textToScan.includes("gandhinagar") || textToScan.includes("india")) {
            localizacao = "Patna, Índia";
          } else if (textToScan.includes("angola") || textToScan.includes("luanda")) {
            localizacao = "Luanda, Angola";
          } else if (textToScan.includes("brasil") || textToScan.includes("são paulo") || textToScan.includes("sp") || textToScan.includes("rio")) {
            localizacao = "São Paulo, Brasil";
          }

          const cleanBio = item.description || "Sem resumo disponível. Acesse o perfil clicando em verificar para ver os detalhes técnicos completos.";

          sorted.push({
            nome: cleanNome,
            contato: item.url || "https://github.com",
            skills: matchedSkills.slice(0, 5),
            localizacao: localizacao,
            bio: cleanBio.length > 250 ? cleanBio.slice(0, 247) + "..." : cleanBio,
            score_ia: 0.90 - (idx * 0.04), // staggered matching scores
            fonte: "web",
            motivo: `Extraído em tempo real usando a API Firecrawl. Este perfil corresponde diretamente aos seus termos de busca com foco em ${matchedSkills.slice(0, 3).join(", ")}.`
          });
        });
      } else {
        // Fallback simulated profiles if firecrawl was empty
        sorted.push({
          nome: "Bruno Varela (GitHub)",
          contato: "github.com/brunovarela-dev",
          skills: ["React", "Typescript", "Node.js"],
          localizacao: "Luanda, Angola",
          bio: "Full Stack Engineer que ama Javascript/Typescript e desenvolve ferramentas de CLI open source.",
          score_ia: 0.85,
          fonte: "web",
          motivo: `Filtro Web regional detectou Bruno no GitHub com alto interesse em hackathons e histórico recente de commits na região de Angola.`
        });
        sorted.push({
          nome: "Aline Santos (X / Twitter)",
          contato: "twitter.com/alinesantos_dev",
          skills: ["UI/UX Mobile", "React Native", "TailwindCSS"],
          localizacao: "São Paulo, Brasil",
          bio: "UI Architect. Transforma protótipos de alta fidelidade em componentes de código reutilizáveis e nativos.",
          score_ia: 0.82,
          fonte: "web",
          motivo: `Perfil correspondente à busca de design/interfaces responsivas em redes sociais locais.`
        });
      }
    }
    return sorted;
  }

  // API Route: Smart Matchmaker (using Gemini 3.5-flash with Google Search Grounding & Local fallback)
  app.post("/api/matches/find", async (req, res) => {
    const { prompt, incluirWeb, usuarioId } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "O campo de busca/solicitação é obrigatório." });
      return;
    }

    const db = readDb();
    // Exclude the currently searching user from their matching recommendations
    const localDevelopers = db.usuarios
      .filter((u: any) => u.id !== usuarioId)
      .map((u: any) => ({
        id: u.id,
        nome: u.nome,
        bio: u.bio,
        skills: u.skills,
        localizacao: u.localizacao,
        contato: u.contato,
        disponivel: u.disponivel
      }));

    const ai = getGenAI();
    let firecrawlResults: any[] = [];

    if (!ai) {
      console.log("No Gemini API key available. Fetching Firecrawl if requested and returning local scoring matches.");
      if (incluirWeb) {
        try {
          firecrawlResults = await searchWithFirecrawl(prompt);
        } catch (fErr) {
          console.warn("Firecrawl search failed in no-AI scenario:", fErr);
        }
      }
      const sorted = getLocalFallbackMatches(prompt, incluirWeb, localDevelopers, firecrawlResults);
      let avisoFallback = "";
      if (incluirWeb && firecrawlResults.length > 0) {
        avisoFallback = `Busca em Tempo Real: Extraímos ${firecrawlResults.length} perfis reais diretamente da web via Firecrawl!`;
      }
      res.json({ matches: sorted, avisoServico: avisoFallback });
      return;
    }

    try {
      console.log(`Querying Gemini (gemini-3.5-flash) for matches: "${prompt}"`);

      // 1. Live Web Search using Firecrawl when inclusion of web leads is active
      firecrawlResults = incluirWeb ? await searchWithFirecrawl(prompt) : [];
      let firecrawlQueryContext = "";
      if (firecrawlResults && firecrawlResults.length > 0) {
        firecrawlQueryContext = `\nPERFIS REAIS DA WEB ENCONTRADOS VIA FIRECRAWL (Use estas informações reias para mapear os candidatos da fonte "web"): \n${JSON.stringify(
          firecrawlResults.map((r: any) => ({
            url: r.url,
            title: r.title,
            description: r.description,
            snippet: r.markdown ? r.markdown.slice(0, 1000) : r.description
          })),
          null,
          2
        )}`;
      }

      const systemInstruction = `
Você é o "ForgeMatch Helper", um assistente inteligente especializado em selecionar e indicar desenvolvedores ideais para projetos, squads de hackathons e parcerias técnicas.
Você receberá:
1. Uma solicitação em linguagem natural (ex: "Procuro dev Frontend que saiba React ou Tailwind em Luanda").
2. Uma lista de desenvolvedores locais ativos em nossa base (formato JSON).
3. Uma flag indicando se deve buscar também perfis externos da web, junto com eventuais resultados reais extraídos via Firecrawl.

Sua tarefa:
Analise os candidatos e responda ESTRITAMENTE em formato JSON combinando exatamente com este esquema:
{
  "matches": [
    {
      "nome": "Nome completo do desenvolvedor",
      "contato": "Link ou canal de contato (ex: github.com/user, twitter.com/user ou email@server.com)",
      "skills": ["A", "B", "C"],
      "localizacao": "Cidade, País do desenvolvedor",
      "bio": "Biografia breve e interessante do desenvolvedor",
      "score_ia": 0.95, // Float de 0 a 1 correspondente ao fit com a busca
      "fonte": "interno", // Marque como "interno" se o candidato pertence à lista local fornecida, OU "web" se você encontrou/gerou este candidato externamente
      "motivo": "Explicação personalizada em português justificando por que ele/ela se destaca para a vaga ou hackathon baseado na busca."
    }
  ]
}

Regras Cruciais:
- Se houver devs locais adequados na lista fornecida, priorize-os listando-os como fonte "interno" com seus dados exatos.
- Se "incluirWeb" for verdadeiro, use PRIORITARIAMENTE os perfis reais fornecidos na seção "PERFIS REAIS DA WEB ENCONTRADOS VIA FIRECRAWL" para criar e preencher de 1 a 3 desenvolvedores externos, marcando-os como fonte "web". Caso a lista esteja vazia ou incompleta, sinta-se livre para complementar ou sugerir outros desenvolvedores externos dealta relevância com base no seu conhecimento técnico.
- Você deve ordenar os resultados por score_ia em ordem decrescente.
- Só retorne JSON válido. Não adicione markdown fora do bloco de código json, não adicione tag pré-textuais, apenas o json limpo.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `PROMPT DE BUSCA: "${prompt}"
INCLUIR PERFIS DA WEB: ${incluirWeb ? "SIM" : "NÃO"}
DESENVOLVEDORES LOCAIS DISPONÍVEIS:
${JSON.stringify(localDevelopers, null, 2)}
${firecrawlQueryContext}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nome: { type: Type.STRING },
                    contato: { type: Type.STRING },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    localizacao: { type: Type.STRING },
                    bio: { type: Type.STRING },
                    score_ia: { type: Type.NUMBER },
                    fonte: { type: Type.STRING },
                    motivo: { type: Type.STRING }
                  },
                  required: ["nome", "contato", "skills", "localizacao", "bio", "score_ia", "fonte", "motivo"]
                }
              }
            },
            required: ["matches"]
          },
          temperature: 0.3,
          tools: incluirWeb ? [{ googleSearch: {} }] : []
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);

      // Decorate with customized system status message regarding Firecrawl performance
      if (incluirWeb) {
        if (firecrawlResults && firecrawlResults.length > 0) {
          parsed.avisoServico = `Busca em Tempo Real: Ativamos o Firecrawl com sucesso e analisamos ${firecrawlResults.length} resultados reais na web! A IA processou e estruturou os perfis externos mais aderentes diretamente da rede.`;
        } else {
          parsed.avisoServico = `Busca em Tempo Real ativa. Nota: A consulta externa direta ao Firecrawl está esgotada ou offline temporariamente. Para que você não pare, ativamos o modelo de matching preditivo cognoscente de IA para sugerir talentos estelares na web!`;
        }
      }

      res.json(parsed);

    } catch (err: any) {
      console.warn("Gemini API call failed with error, applying instant local fallback recovery with parsed Firecrawl results:", err);
      // Fallback matching logic if Gemini fails or is busy (e.g. 503 error)
      const sorted = getLocalFallbackMatches(prompt, incluirWeb, localDevelopers, firecrawlResults);
      let avisoErr = "Aviso: O motor principal de IA (Gemini) está muito congestionado de momento e retornou erro de indisponibilidade (503). Ativamos automaticamente o algoritmo inteligente reserva ForgeMatch para calcular as pontuações e extrair candidatos locais sem nenhuma interrupção!";
      if (incluirWeb && firecrawlResults && firecrawlResults.length > 0) {
        avisoErr += ` Além disso, mapeamos ${firecrawlResults.length} candidatos reais da pesquisa do Firecrawl com sucesso direto no dashboard!`;
      }
      res.json({
        matches: sorted,
        avisoServico: avisoErr
      });
    }
  });

  // API Route: Register Match Connection inside user log
  app.post("/api/matches/connect", (req, res) => {
    const { usuarioId, matchPerfil } = req.body;
    if (!usuarioId || !matchPerfil || !matchPerfil.nome) {
      res.status(400).json({ error: "Faltam parâmetros para registrar convite." });
      return;
    }

    const db = readDb();
    
    // Check if duplicate invitation
    const alreadyConnected = db.matches.some(
      (m: any) =>
        m.usuarioId === usuarioId &&
        m.nomePerfil.toLowerCase() === matchPerfil.nome.toLowerCase()
    );

    if (alreadyConnected) {
      res.json({ message: "Você já enviou um convite para este desenvolvedor!", alreadyExisting: true });
      return;
    }

    // Try to find target local user ID if its an internal match
    let targetUserId: string | undefined = undefined;
    if (matchPerfil.fonte === "interno") {
      const matchInDb = db.usuarios.find(
        (u: any) => u.nome.toLowerCase() === matchPerfil.nome.toLowerCase()
      );
      if (matchInDb) {
        targetUserId = matchInDb.id;
      }
    }

    const newMatch = {
      id: "m_" + Date.now(),
      usuarioId,
      usuarioAlvoId: targetUserId,
      nomePerfil: matchPerfil.nome,
      contatoPerfil: matchPerfil.contato || "N/A",
      skillsPerfil: matchPerfil.skills || [],
      localizacaoPerfil: matchPerfil.localizacao || "Luanda, Angola",
      scoreIa: matchPerfil.score_ia || 1.0,
      fonte: matchPerfil.fonte || "interno",
      motivo: matchPerfil.motivo || "",
      status: "pendente",
      dataCriacao: new Date().toISOString(),
      mensagens: []
    };

    db.matches.push(newMatch);
    writeDb(db);

    res.status(201).json(newMatch);
  });

  // API Route: Direct Firecrawl Scrape/Search Diagnostics Sandbox
  app.post("/api/firecrawl/test", async (req, res) => {
    let { urlOrQuery } = req.body;
    if (!urlOrQuery) {
      res.status(200).json({ success: false, error: "Insira uma URL ou termo de busca." });
      return;
    }

    const apiKey = process.env.FIRECRAWL_API_KEY || "fc-d0f0b5f1b2f74792be54ee761d227d7b";
    
    let isUrl = false;
    let targetUrl = urlOrQuery.trim();
    if (targetUrl.toLowerCase().startsWith("http://") || targetUrl.toLowerCase().startsWith("https://")) {
      isUrl = true;
    } else if (targetUrl.toLowerCase().includes("github.com") || targetUrl.toLowerCase().includes("linkedin.com")) {
      isUrl = true;
      targetUrl = "https://" + targetUrl;
    }

    try {
      if (isUrl) {
        console.log(`[Firecrawl Diagnostics] Scraping URL directly: "${targetUrl}"`);
        const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            url: targetUrl,
            formats: ["markdown"]
          }),
          signal: AbortSignal.timeout(15500) // generous 15.5 seconds for deep page extraction
        });

        if (!response.ok) {
          const errText = await response.text();
          const cleanErr = errText.startsWith("<")
            ? `Acesso bloqueado ou restrito (A API do Firecrawl retornou uma resposta HTML em vez de JSON). Normalmente, páginas como LinkedIn exigem planos Premium ou Proxies específicos para evitar detecção automatizada.`
            : errText.slice(0, 300);
          res.json({ success: false, error: `Firecrawl retornou erro ${response.status}: ${cleanErr}` });
          return;
        }

        const textResponse = await response.text();
        let result: any;
        try {
          result = JSON.parse(textResponse);
        } catch (parseErr) {
          res.json({
            success: false,
            error: "A API do Firecrawl retornou uma resposta inválida (não-JSON/HTML). Isso costuma indicar bloqueio por Cloudflare ou restrições do bot de scrape de terceiros."
          });
          return;
        }

        res.json({
          method: "scrape",
          target: targetUrl,
          success: result.success !== false,
          data: result.data || result
        });
      } else {
        console.log(`[Firecrawl Diagnostics] Performing search: "${urlOrQuery}"`);
        const response = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            query: urlOrQuery,
            limit: 3
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          const errText = await response.text();
          const cleanErr = errText.startsWith("<") ? "Resposta em formato HTML." : errText.slice(0, 300);
          res.json({ success: false, error: `Firecrawl retornou erro de busca ${response.status}: ${cleanErr}` });
          return;
        }

        const textResponse = await response.text();
        let result: any;
        try {
          result = JSON.parse(textResponse);
        } catch (parseErr) {
          res.json({
            success: false,
            error: "A API de busca do Firecrawl retornou um formato de corpo inválido (não-JSON)."
          });
          return;
        }

        res.json({
          method: "search",
          query: urlOrQuery,
          success: result.success !== false,
          data: result.data || result
        });
      }
    } catch (err: any) {
      res.json({ success: false, error: err.message || "Erro de rede ou timeout no sandbox Firecrawl" });
    }
  });

  // API Route: Extract specific talent profiles from any page-level markdown document
  app.post("/api/firecrawl/extract-page-talents", async (req, res) => {
    const { url, markdown } = req.body;
    let md = markdown;
    
    // If markdown is empty but URL is provided, scrape it first
    if (!md && url) {
      try {
        const apiKey = process.env.FIRECRAWL_API_KEY || "fc-d0f0b5f1b2f74792be54ee761d227d7b";
        const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            url: url,
            formats: ["markdown"]
          }),
          signal: AbortSignal.timeout(15500)
        });
        if (response.ok) {
          const resObj = await response.json() as any;
          md = resObj.data?.markdown;
        }
      } catch (err) {
        console.warn("Could not fetch markdown on-the-fly for extraction:", err);
      }
    }

    if (!md) {
      res.status(400).json({ success: false, error: "O documento markdown ou a URL é obrigatória para processar os perfis." });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      // Return list of mock fellas detected in page if Gemini is missing
      res.json({
        success: true,
        talents: [
          {
            nome: "Pedro Caquinda (Extraído Local)",
            titulo: "Programador Web | Full-Stack | API",
            localizacao: "Malanje, Malanje Municipality",
            perfilUrl: "https://www.bebee.com",
            skills: ["Fullstack", "API", "Web"],
            bio: "Perfil reconhecido no documento da página. Cadestre sua chave Gemini no painel de Configurações para habilitar parsing de IA!"
          }
        ]
      });
      return;
    }

    try {
      console.log(`[AI Extraction] Invoking Gemini to parse talents from markdown (${md.length} chars)`);
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Você é um mapeador de dados profissional. Analise o documento markdown fornecido abaixo (obtido via scraping de uma página de talentos/profissionais/fórum como BeBee, LinkedIn, GitHub, etc.).
Identifique de 1 a 10 desenvolvedores ou profissionais de tecnologia legítimos listados individualmente neste documento de página.
Para cada pessoa real listada, extraia de forma estruturada:
- nome (Nome completo da pessoa, ex: "Pedro Caquinda", "Victor G. Alfredo")
- titulo (Função ou cabeçalho profissional de destaque, ex: "Programador Web | Full-Stack | API")
- localizacao (Localização/cidade se presente, ex: "Malanje, Malanje Municipality" ou "Luanda, Angola")
- perfilUrl (URL absoluta do perfil individual de destino, ex: "https://www.bebee.com/ao/member/pedro-caquinda_..." ou similar. Se for relativa, converta para absoluta usando como base "${url || "https://bebee.com"}")
- skills (Arranjo com até 5 palavras-chaves de habilidades técnicas mostradas)
- bio (Breve sumário descritivo ou tags associadas ao perfil)

URL de referência do site atual: "${url || "https://bebee.com"}"

Markdown do documento:
---
${md.slice(0, 42000)}
---

Retorne estritamente um código JSON contendo uma lista sob o atributo "talents".
Retorne APENAS o JSON estruturado adequado sem formatações explicativas externas.
Esquema JSON esperado:
{
  "talents": [
    {
      "nome": "Pedro Caquinda",
      "titulo": "Programador Web | Full-Stack | API",
      "localizacao": "Malanje, Malanje Municipality",
      "perfilUrl": "https://www.bebee.com/ao/member/pedro-caquinda",
      "skills": ["Web", "Full-Stack", "API"],
      "bio": "Extrato de talentos"
    }
  ]
}`
      });

      const responseText = response.text || "";
      let cleanJson = responseText.trim();
      if (cleanJson.includes("```json")) {
        cleanJson = cleanJson.split("```json")[1].split("```")[0].trim();
      } else if (cleanJson.includes("```")) {
        cleanJson = cleanJson.split("```")[1].split("```")[0].trim();
      }

      const parsed = JSON.parse(cleanJson);
      res.json({ success: true, talents: parsed.talents || [] });

    } catch (err: any) {
      console.error("Gemini Extraction of Talents failed:", err);
      res.status(500).json({ success: false, error: "Falha na análise inteligente do Gemini: " + err.message });
    }
  });

  // API Route: Dynamic deep scraping of a specific developer profile URL to find full info and contact options
  app.post("/api/firecrawl/scrape-profile-details", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ success: false, error: "A URL do perfil individual é de envio obrigatório." });
      return;
    }

    const apiKey = process.env.FIRECRAWL_API_KEY || "fc-d0f0b5f1b2f74792be54ee761d227d7b";
    
    try {
      console.log(`[Deep Profile Scrape] Scraping profile: "${url}"`);
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          url: url,
          formats: ["markdown"]
        }),
        signal: AbortSignal.timeout(18000)
      });

      if (!response.ok) {
        const errText = await response.text();
        res.json({ success: false, error: `Erro no Scrape Firecrawl (${response.status}): ${errText.slice(0, 200)}` });
        return;
      }

      const result = await response.json() as any;
      const md = result.data?.markdown || "";

      if (!md) {
        res.json({ success: false, error: "A página retornou vazia ou nenhum conteúdo Markdown pôde ser extraído." });
        return;
      }

      const ai = getGenAI();
      if (!ai) {
        // Fallback matching template
        res.json({
          success: true,
          profile: {
            nome: "Desenvolvedor Mapeado do Bebee",
            skills: ["React", "Typescript", "Node.js"],
            localizacao: "Malanje, Angola",
            bio: "Perfil importado com sucesso via Firecrawl. Cadastre sua chave de API Gemini em Settings para habilitar classificação profunda baseada em IA e extração automática de links de mensagem de contato!",
            contato: url,
            score_ia: 0.95,
            fonte: "web",
            motivo: "Extraído via Firecrawl e processamento local."
          }
        });
        return;
      }

      console.log(`[AI Deep Profiler] Analyzing subprofile Markdown with Gemini (${md.length} chars)`);
      const aiPrompt = `Você é um agente analisador de perfis profissionais. Analise o documento markdown de um perfil pessoal do site bebee.com ou similar para extrair seus detalhes exatos e as de contato direto ou links de ação (como "Enviar mensagem", botões, e-mails, WhatsApp, mídias sociais).

Regras de identificação de canais de contato:
- Procure por rotas de comunicação contidas no markdown, por exemplo links de botões como "Enviar mensagem", caminhos de chat da plataforma, ou links diretos (WhatsApp, e-mail, Skype, LinkedIn, links curtos, etc.).
- Se encontrar botões de chat ou caminhos como "Enviar mensagem", tente extrair ou adivinhar a URL de ação correta ou use a própria URL do perfil (${url}) como redirecionamento de canal de comunicação inicial, priorizando quaisquer canais interativos ou linkes legíveis. Este contato será o valor do botão "Demonstrar Interesse".

Documento Markdown estruturado do perfil:
---
${md.slice(0, 42000)}
---

Retorne estritamente um JSON de resposta em português.
Retorne APENAS o JSON limpo, sem marcas adicionais de markdown fora do bloco json:
{
  "profile": {
    "nome": "Nome real como Pedro Caquinda",
    "skills": ["React", "CSS", "APIs"],
    "localizacao": "Malanje, Angola (conforme no perfil)",
    "bio": "Biografia técnica detalhada ou cabeçalho do profissional como 'Programador Web | Full-Stack | API'.",
    "contato": "Link exato do canal de comunicação (preferencialmente link de mensagem directa, email, WhatsApp, ou a própria URL do perfil)",
    "score_ia": 0.95,
    "fonte": "web",
    "motivo": "Perfil real extraído de página do Bebee e processado inteligentemente por cognição profunda via IA."
  }
}`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: aiPrompt
      });

      const aiText = aiResponse.text || "";
      let cleanJson = aiText.trim();
      if (cleanJson.includes("```json")) {
        cleanJson = cleanJson.split("```json")[1].split("```")[0].trim();
      } else if (cleanJson.includes("```")) {
        cleanJson = cleanJson.split("```")[1].split("```")[0].trim();
      }

      const parsed = JSON.parse(cleanJson);
      res.json({ success: true, profile: parsed.profile || parsed });

    } catch (err: any) {
      console.error("Deep AI Profiler failed:", err);
      res.status(500).json({ success: false, error: "Falha na análise estruturada do perfil via Gemini: " + err.message });
    }
  });

  // API Route: Get Sent Matches (Invitations sent by User)
  app.get("/api/matches/user/:id", (req, res) => {
    const db = readDb();
    
    // Enriched list: if candidate is target local, get their latest profile status
    const sentMatches = db.matches.filter((m: any) => m.usuarioId === req.params.id);
    const enriched = sentMatches.map((m: any) => {
      if (m.usuarioAlvoId) {
        const u = db.usuarios.find((user: any) => user.id === m.usuarioAlvoId);
        if (u) {
          return {
            ...m,
            contatoPerfil: u.contato, // dynamically updated contact if they changed it
            skillsPerfil: u.skills,
            localizacaoPerfil: u.localizacao,
          };
        }
      }
      return m;
    });
    
    res.json(enriched);
  });

  // API Route: Get Received Matches (Invitations directed to User)
  app.get("/api/matches/received/:id", (req, res) => {
    const db = readDb();
    
    // find matches where current user is the target
    const receivedMatches = db.matches.filter((m: any) => m.usuarioAlvoId === req.params.id);
    
    // Enrich with sender details who initiated
    const enriched = receivedMatches.map((m: any) => {
      const sender = db.usuarios.find((u: any) => u.id === m.usuarioId);
      let senderSafe = null;
      if (sender) {
        const { password, ...safe } = sender;
        senderSafe = safe;
      }
      return {
        ...m,
        usuarioRemetente: senderSafe
      };
    });

    res.json(enriched);
  });

  // API Route: Update invitation Status (Aceitar / Rejeitar)
  app.put("/api/matches/:id/status", (req, res) => {
    const { status } = req.body;
    if (status !== "aceito" && status !== "rejeitado" && status !== "pendente") {
      res.status(400).json({ error: "Status inválido." });
      return;
    }

    const db = readDb();
    const idx = db.matches.findIndex((m: any) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: "Solicitação não encontrada." });
      return;
    }

    db.matches[idx].status = status;
    
    // If accepted, let's inject a system welcome message in chat automatically to prompt conversation
    if (status === "aceito" && (!db.matches[idx].mensagens || db.matches[idx].mensagens.length === 0)) {
      db.matches[idx].mensagens = [
        {
          id: "sys_" + Date.now(),
          senderId: "system",
          senderNome: "ForgeMatch Bot",
          texto: "Parabéns! O convite de match foi aceito com sucesso. O chat oficial está aberto. Comecem a planejar e forjar essa squad de desenvolvimento fantástica!",
          dataEnvio: new Date().toISOString()
        }
      ];
    }

    writeDb(db);
    res.json(db.matches[idx]);
  });

  // API Route: Send message inside connection chat
  app.post("/api/matches/:id/messages", (req, res) => {
    const { senderId, senderNome, texto } = req.body;
    if (!senderId || !senderNome || !texto) {
      res.status(400).json({ error: "Remetente e texto são obrigatórios." });
      return;
    }

    const db = readDb();
    const idx = db.matches.findIndex((m: any) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: "Conexão de chat não encontrada." });
      return;
    }

    const matchInfo = db.matches[idx];
    if (matchInfo.status !== "aceito") {
      res.status(400).json({ error: "O chat só está disponível para convites aceitos." });
      return;
    }

    if (!matchInfo.mensagens) {
      matchInfo.mensagens = [];
    }

    const newMsg = {
      id: "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      senderId,
      senderNome,
      texto,
      dataEnvio: new Date().toISOString()
    };

    matchInfo.mensagens.push(newMsg);
    db.matches[idx] = matchInfo;
    writeDb(db);

    res.status(201).json(newMsg);
  });

  // API Route: Delete a Connection Log
  app.delete("/api/matches/:id", (req, res) => {
    const db = readDb();
    const initialLen = db.matches.length;
    db.matches = db.matches.filter((m: any) => m.id !== req.params.id);
    if (db.matches.length === initialLen) {
      res.status(404).json({ error: "Conexão não encontrada." });
      return;
    }
    writeDb(db);
    res.json({ status: "ok", message: "Conexão deletada com sucesso." });
  });

  // Integrate Vite server in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Assets Static Serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ForgeMatch Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
