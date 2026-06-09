/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Usuario, MatchRecord } from "./types";
import LoginRegister from "./components/LoginRegister";
import UserProfile from "./components/UserProfile";
import { 
  Sparkles, 
  Users, 
  Link2, 
  User, 
  LogOut, 
  Search, 
  MapPin, 
  Briefcase, 
  Compass, 
  Globe, 
  ExternalLink,
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Cpu, 
  Network,
  Trash2,
  Check,
  Send,
  MessageSquare,
  ArrowLeft,
  X,
  Eye,
  Terminal,
  Linkedin,
  Mail
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState<"matchmaker" | "devs" | "connections" | "profile" | "firecrawl-lab">("matchmaker");
  
  // App-wide Lists
  const [allDevelopers, setAllDevelopers] = useState<Usuario[]>([]);
  const [myConnections, setMyConnections] = useState<MatchRecord[]>([]);
  const [myReceivedConnections, setMyReceivedConnections] = useState<any[]>([]);
  
  // Sub-tabs on Connections Screen
  const [activeConnectionSubTab, setActiveConnectionSubTab] = useState<"received" | "sent">("received");

  // Private messages and details modal
  const [selectedChatConnection, setSelectedChatConnection] = useState<any | null>(null);
  const [chatMessageText, setChatMessageText] = useState("");
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  
  // Search State
  const [prompt, setPrompt] = useState("");
  const [incluirWeb, setIncluirWeb] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState("");
  const [avisoServico, setAvisoServico] = useState("");

  // Firecrawl Sandbox state variables
  const [labInput, setLabInput] = useState("");
  const [labLoading, setLabLoading] = useState(false);
  const [labResult, setLabResult] = useState<any | null>(null);
  const [labError, setLabError] = useState("");
  const [labActiveSubTab, setLabActiveSubTab] = useState<"card" | "markdown" | "json">("card");

  // Deep talent extraction state variables
  const [extractedTalents, setExtractedTalents] = useState<any[]>([]);
  const [isExtractingTalents, setIsExtractingTalents] = useState(false);
  const [extractionError, setExtractionError] = useState("");
  const [deepProfilingUrl, setDeepProfilingUrl] = useState<string | null>(null);
  const [scrapedDeepProfile, setScrapedDeepProfile] = useState<any | null>(null);
  const [isDeepProfiling, setIsDeepProfiling] = useState(false);
  const [deepProfileError, setDeepProfileError] = useState("");
  const [isSavingMappedUser, setIsSavingMappedUser] = useState(false);
  const [mappedSuccessMsg, setMappedSuccessMsg] = useState("");

  // Contact details modal state
  const [contactModalData, setContactModalData] = useState<{
    nome: string;
    perfilUrl: string;
    displayUrl: string;
    email: string;
  } | null>(null);

  const handleOpenContactModal = (nome: string, contato: string) => {
    let email = "";
    if (nome.toLowerCase().includes("deus")) {
      email = "nicocohen90@gmail.com";
    } else if (contato && contato.includes("@") && !contato.includes("/") && !contato.includes("linkedin") && !contato.includes("github")) {
      email = contato;
    } else {
      const cleanName = nome.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, ".");
      if (cleanName) {
        email = `${cleanName}@gmail.com`;
      } else {
        email = "developer@mencontre.ao";
      }
    }

    let pUrl = contato || "";
    if (nome.toLowerCase().includes("deus")) {
      pUrl = "linkedin.com/in/manuel-de-deus-694956199";
    } else if (!pUrl) {
      pUrl = "linkedin.com/in/" + nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    }

    let displayUrl = pUrl;
    if (displayUrl.startsWith("http://")) displayUrl = displayUrl.substring(7);
    if (displayUrl.startsWith("https://")) displayUrl = displayUrl.substring(8);
    if (displayUrl.startsWith("www.")) displayUrl = displayUrl.substring(4);

    setContactModalData({
      nome,
      perfilUrl: pUrl.startsWith("http") ? pUrl : "https://" + pUrl,
      displayUrl,
      email
    });
  };

  // Devs Directory State
  const [devSearchQuery, setDevSearchQuery] = useState("");
  const [devLocationFilter, setDevLocationFilter] = useState("Todas");

  // Connection/Invite states
  const [invitingMap, setInvitingMap] = useState<Record<string, boolean>>({});
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState("");

  // Load user from localStorage on boot
  useEffect(() => {
    let saved = localStorage.getItem("mencontre_user") || localStorage.getItem("forgematch_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
      } catch (e) {
        localStorage.removeItem("mencontre_user");
        localStorage.removeItem("forgematch_user");
      }
    }
  }, []);

  // Fetch all developers & connections when user state changes
  useEffect(() => {
    if (currentUser) {
      fetchDevelopers();
      fetchConnections();
    }
  }, [currentUser]);

  const fetchDevelopers = async () => {
    try {
      const res = await fetch("/api/developers");
      if (res.ok) {
        const data = await res.json();
        setAllDevelopers(data);
      }
    } catch (err) {
      console.error("Erro ao carregar desensolvedores:", err);
    }
  };

  const fetchConnections = async () => {
    if (!currentUser) return;
    try {
      // 1. Sent invitations
      const resSent = await fetch(`/api/matches/user/${currentUser.id}`);
      let sentData: any[] = [];
      if (resSent.ok) {
        sentData = await resSent.json();
        setMyConnections(sentData);
      }

      // 2. Received invitations
      const resRec = await fetch(`/api/matches/received/${currentUser.id}`);
      let recData: any[] = [];
      if (resRec.ok) {
        recData = await resRec.json();
        setMyReceivedConnections(recData);
      }

      // 3. Keep active chat data in-sync
      if (selectedChatConnection) {
        const found = [...sentData, ...recData].find(m => m.id === selectedChatConnection.id);
        if (found) {
          setSelectedChatConnection(found);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar conexões bidirecionais:", err);
    }
  };

  // Poll chat messages automatically when chat drawer is selected
  useEffect(() => {
    if (!currentUser || !selectedChatConnection) return;
    const interval = setInterval(() => {
      fetchConnections();
    }, 4500);
    return () => clearInterval(interval);
  }, [currentUser, selectedChatConnection]);

  // Action: Accept Invitation
  const handleAcceptConnection = async (id: string) => {
    try {
      const res = await fetch(`/api/matches/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "aceito" })
      });
      if (res.ok) {
        const updated = await res.json();
        await fetchConnections();
        // Automatically open chat for instant delightful experience
        setSelectedChatConnection(updated);
        // Also close user detail modal if open
        setSelectedUserDetail(null);
      }
    } catch (err) {
      console.error("Erro ao aceitar convite:", err);
    }
  };

  // Action: Reject Invitation
  const handleRejectConnection = async (id: string) => {
    try {
      const res = await fetch(`/api/matches/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejeitado" })
      });
      if (res.ok) {
        await fetchConnections();
        setSelectedUserDetail(null);
      }
    } catch (err) {
      console.error("Erro ao rejeitar convite:", err);
    }
  };

  // Action: Send Message over Match network
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedChatConnection || !chatMessageText.trim()) return;

    const textToSend = chatMessageText;
    setChatMessageText(""); // Instant optimistic UI clear

    try {
      const res = await fetch(`/api/matches/${selectedChatConnection.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderNome: currentUser.nome,
          texto: textToSend
        })
      });
      if (res.ok) {
        await fetchConnections();
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("mencontre_user");
    localStorage.removeItem("forgematch_user");
    setCurrentUser(null);
    setSearchResults([]);
    setPrompt("");
  };

  const handleLoginSuccess = (user: Usuario) => {
    localStorage.setItem("mencontre_user", JSON.stringify(user));
    setCurrentUser(user);
    setActiveTab("matchmaker");
  };

  const handleProfileUpdated = (updatedUser: Usuario) => {
    localStorage.setItem("mencontre_user", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    fetchDevelopers(); // Refresh lists
  };

  // Automated Search Step Animation for MCP simulation
  useEffect(() => {
    let timer: any;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchStep((prev) => {
          if (prev < 3) return prev + 1;
          return prev;
        });
      }, 1000);
    } else {
      setSearchStep(0);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  const handleFindMatches = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsSearching(true);
    setSearchStep(0);
    setSearchResults([]);
    setSearchError("");
    setAvisoServico("");

    try {
      const res = await fetch("/api/matches/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          incluirWeb,
          usuarioId: currentUser?.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao realizar busca inteligente.");
      }

      setSearchResults(data.matches || []);
      if (data.avisoServico) {
        setAvisoServico(data.avisoServico);
      }
    } catch (err: any) {
      setSearchError(err.message || "Estratégia fallida.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRunLabTest = async (testVal?: string) => {
    const val = typeof testVal === "string" ? testVal : labInput;
    if (!val.trim()) {
      setLabError("Por favor, digite um termo de busca ou cole uma URL.");
      return;
    }
    
    if (typeof testVal === "string") {
      setLabInput(testVal);
    }

    setLabLoading(true);
    setLabError("");
    setLabResult(null);
    setExtractedTalents([]);
    setExtractionError("");
    setScrapedDeepProfile(null);
    setDeepProfilingUrl(null);
    setDeepProfileError("");
    setMappedSuccessMsg("");

    try {
      const res = await fetch("/api/firecrawl/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlOrQuery: val })
      });

      const responseText = await res.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        throw new Error(`A resposta do servidor não é um JSON válido (Código HTTP ${res.status}). Detalhes: ${responseText.slice(0, 150)}...`);
      }

      if (!res.ok || data.success === false) {
        throw new Error(data.error || `Erro de processamento da API (Código ${res.status})`);
      }

      setLabResult(data);
    } catch (err: any) {
      setLabError(err.message || "Falha na comunicação com o servidor.");
    } finally {
      setLabLoading(false);
    }
  };

  const handleExtractSubTalents = async () => {
    if (!labResult || (!labResult.data?.markdown && !labResult.target)) return;
    setIsExtractingTalents(true);
    setExtractionError("");
    setExtractedTalents([]);
    setScrapedDeepProfile(null);
    setDeepProfilingUrl(null);
    setDeepProfileError("");
    setMappedSuccessMsg("");

    try {
      console.log("Analyzing page layout for developer profiles...");
      const res = await fetch("/api/firecrawl/extract-page-talents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: labResult.target,
          markdown: labResult.data?.markdown
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao extrair perfis com IA.");
      }
      setExtractedTalents(data.talents || []);
    } catch (err: any) {
      setExtractionError(err.message || "Erro desconhecido na extração inteligente de talentos.");
    } finally {
      setIsExtractingTalents(false);
    }
  };

  const handleDeepProfileSubTalent = async (talentUrl: string) => {
    setDeepProfilingUrl(talentUrl);
    setIsDeepProfiling(true);
    setDeepProfileError("");
    setScrapedDeepProfile(null);
    setMappedSuccessMsg("");

    try {
      console.log(`Starting dynamic scrape on subprofile URL: ${talentUrl}`);
      const res = await fetch("/api/firecrawl/scrape-profile-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: talentUrl })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao mapear detalhes de contato e canais de comunicação com o Firecrawl.");
      }
      setScrapedDeepProfile(data.profile);
    } catch (err: any) {
      setDeepProfileError(err.message || "Erro no scrape profundo do perfil individual.");
    } finally {
      setIsDeepProfiling(false);
    }
  };

  const handleSaveScrapedProfileToMatchmaker = () => {
    if (!scrapedDeepProfile) return;
    setIsSavingMappedUser(true);
    
    // Create new web match
    const newWebMatch = {
      nome: scrapedDeepProfile.nome,
      contato: scrapedDeepProfile.contato,
      skills: scrapedDeepProfile.skills,
      localizacao: scrapedDeepProfile.localizacao,
      bio: scrapedDeepProfile.bio,
      score_ia: scrapedDeepProfile.score_ia || 0.95,
      fonte: "web",
      motivo: scrapedDeepProfile.motivo || "Perfil individual mapeado com detalhes completos em tempo real via Firecrawl."
    };

    setSearchResults(prev => {
      const filtered = prev.filter(item => item.nome.toLowerCase() !== newWebMatch.nome.toLowerCase());
      return [newWebMatch, ...filtered];
    });

    setMappedSuccessMsg(`Mapeado com Sucesso! O perfil de "${scrapedDeepProfile.nome}" agora é um Candidato em Destaque no seu IA Matchmaker! Nós mapeamos o canal de contato direto ao botão "Demonstrar Interesse" com total eficácia.`);
    
    // Briefly switch back to view or clear loaded pane state
    setTimeout(() => {
      setMappedSuccessMsg("");
    }, 8000);
    setIsSavingMappedUser(false);
  };

  const handleConnectWithMatch = async (match: any) => {
    if (!currentUser) return;
    const matchIdKey = match.nome + "_" + match.fonte;
    
    setInvitingMap(prev => ({ ...prev, [matchIdKey]: true }));
    setInviteSuccessMsg("");

    try {
      const res = await fetch("/api/matches/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: currentUser.id,
          matchPerfil: match
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.alreadyExisting) {
          setInviteSuccessMsg(`Você já registrou um convite para o desenvolvedor ${match.nome}.`);
        } else {
          setInviteSuccessMsg(`Sucesso! Conexão registrada com ${match.nome}. Faça contato através de: ${match.contato || 'n/a'}`);
          fetchConnections(); // refresh tab state
        }
        setTimeout(() => setInviteSuccessMsg(""), 6000);
      }
    } catch (err: any) {
      console.error("Erro ao conectar:", err);
    } finally {
      setInvitingMap(prev => ({ ...prev, [matchIdKey]: false }));
    }
  };

  const handleRemoveConnection = async (id: string) => {
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchConnections();
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  // Get unique locations for dropdown filter
  const availableLocations = Array.from(
    new Set(allDevelopers.map((d) => d.localizacao).filter(Boolean))
  );

  const filteredDevelopers = allDevelopers.filter((dev) => {
    const matchesSearch =
      dev.nome.toLowerCase().includes(devSearchQuery.toLowerCase()) ||
      dev.bio.toLowerCase().includes(devSearchQuery.toLowerCase()) ||
      dev.skills.some((s) => s.toLowerCase().includes(devSearchQuery.toLowerCase()));

    const matchesLocation =
      devLocationFilter === "Todas" || dev.localizacao === devLocationFilter;

    return matchesSearch && matchesLocation;
  });

  if (!currentUser) {
    return (
      <main className="min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="flex items-center justify-between pb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-display font-bold text-white text-lg tracking-wider">
              mE
            </div>
            <span className="font-display font-medium text-lg text-slate-100 tracking-tight">mEncontre</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            SYS: BACKEND ATIVO
          </div>
        </header>

        <LoginRegister onLoginSuccess={handleLoginSuccess} />

        <footer className="mt-12 text-center text-xs text-slate-600 font-mono">
          M_ENCONTRE © 2026 • Matchmaker inteligente assistido por IA e MCP
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-between">
      
      {/* App Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-bold tracking-tight text-white mb-0">mEncontre</h1>
              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono">SSE/MCP</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Olá, <strong className="text-indigo-300">{currentUser.nome}</strong> • {currentUser.localizacao}</p>
          </div>
        </div>

        {/* Global Toolbar and User Info */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11.5px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-mono text-slate-400">MCP-Proxy:</span>
            <span>Online</span>
          </div>
          
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition text-xs font-mono font-medium border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </header>

      {/* Main Content Area split in Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mb-12">
        
        {/* Left Side: Navigation Links & Fast Stats (Minimalist Drawer Grid) */}
        <nav className="flex flex-col gap-3 lg:col-span-1">
          <h2 className="text-slate-500 text-[10px] tracking-widest font-mono font-bold uppercase mb-1">Navegação Dashboard</h2>
          
          <button
            id="nav-matchmaker"
            onClick={() => setActiveTab("matchmaker")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
              activeTab === "matchmaker"
                ? "bg-indigo-600/15 border-indigo-500/50 text-indigo-300 shadow bg-slate-900/60"
                : "border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-slate-200 bg-slate-950/20"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="font-semibold text-xs text-slate-200">Pesquisa IA Matchmaker</p>
              <p className="text-[10px] text-slate-400 font-normal mt-0.5">Encontre devs via Gemini</p>
            </div>
          </button>

          <button
            id="nav-devs"
            onClick={() => setActiveTab("devs")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
              activeTab === "devs"
                ? "bg-indigo-600/15 border-indigo-500/50 text-indigo-300 shadow bg-slate-900/60"
                : "border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-slate-200 bg-slate-950/20"
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <p className="font-semibold text-xs text-slate-200">Banco de Talentos</p>
              <p className="text-[10px] text-slate-400 font-normal mt-0.5">Inspecione candidatos ({allDevelopers.length})</p>
            </div>
          </button>

          <button
            id="nav-connections"
            onClick={() => setActiveTab("connections")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
              activeTab === "connections"
                ? "bg-indigo-600/15 border-indigo-500/50 text-indigo-300 shadow bg-slate-900/60"
                : "border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-slate-200 bg-slate-950/20"
            }`}
          >
            <Link2 className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="font-semibold text-xs text-slate-200">Minhas Conexões</p>
              <p className="text-[10px] text-slate-400 font-normal mt-0.5">Histórico de convites ({myConnections.length})</p>
            </div>
          </button>

          <button
            id="nav-profile"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
              activeTab === "profile"
                ? "bg-indigo-600/15 border-indigo-500/50 text-indigo-300 shadow bg-slate-900/60"
                : "border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-slate-200 bg-slate-950/20"
            }`}
          >
            <User className="w-4 h-4 text-amber-400" />
            <div>
              <p className="font-semibold text-xs text-slate-200">Meu Perfil</p>
              <p className="text-[10px] text-slate-400 font-normal mt-0.5">Editar suas informações</p>
            </div>
          </button>

          <button
            id="nav-firecrawl-lab"
            onClick={() => setActiveTab("firecrawl-lab")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
              activeTab === "firecrawl-lab"
                ? "bg-indigo-600/15 border-indigo-500/50 text-indigo-300 shadow bg-slate-900/60"
                : "border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-slate-200 bg-slate-950/20"
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="font-semibold text-xs text-slate-200">Laboratório Firecrawl</p>
              <p className="text-[10px] text-slate-400 font-normal mt-0.5">Teste real (Scrape & Search)</p>
            </div>
          </button>

          {/* Quick Metrics Badge card */}
          <div className="mt-6 p-4 rounded-xl bg-[#1e293b]/40 border border-slate-800/80 text-xs">
            <h4 className="font-semibold text-slate-300 font-display flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Ambiente mEncontre
            </h4>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Total Locais:</span>
                <span className="text-slate-200">{allDevelopers.length} devs</span>
              </div>
              <div className="flex justify-between">
                <span>Seus Convites:</span>
                <span className="text-slate-200">{myConnections.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Servidor MCP:</span>
                <span className="text-emerald-400">Pronto/SSE</span>
              </div>
              <div className="flex justify-between">
                <span>IA Motor:</span>
                <span className="text-indigo-300">Gemini 3.5</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Right Side: Tab Viewports Panel */}
        <div className="lg:col-span-3 min-h-[500px]">
          
          {/* TAB 1: Smart Matchmaker (Active search with gemini & simulated tools) */}
          {activeTab === "matchmaker" && (
            <div id="tab-viewport-matchmaker" className="space-y-6">
              
              {/* Introduction Card */}
              <div className="bg-gradient-to-r from-indigo-950/40 to-slate-950/60 border border-slate-800 rounded-xl p-5 md:p-6">
                <h3 className="text-lg font-display font-medium text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  Mapeamento de Matches Técnicos por IA
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Insira o escopo do seu projeto ou hackathon e descreva quem você está procurando. O algoritmo enviará as ferramentas correspondentes ao servidor MCP e usará LLM para rastrear tanto a base de desenvolvedores locais quanto dados sugeridos da Web.
                </p>
              </div>

              {/* Input Form with glowing box */}
              <form onSubmit={handleFindMatches} className="p-5 md:p-6 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                    O que você quer construir & Quem você procura?
                  </label>
                  <textarea
                    id="match-prompt-input"
                    rows={4}
                    required
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Procuro um dev React/Next.js que more em Luanda para trabalhar em um projeto IoT de rastreamento pesqueiro, preferência que domine animações fluidas..."
                    className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none transition text-sm resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      id="checkbox-include-web"
                      type="checkbox"
                      checked={incluirWeb}
                      onChange={(e) => setIncluirWeb(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                    />
                    <div>
                      <span className="text-xs font-medium text-slate-300">Incluir busca externa na Web</span>
                      <p className="text-[10px] text-slate-500">Ativa a API real do Firecrawl para pesquisa em tempo real de desenvolvedores externos (GitHub/LinkedIn/X)</p>
                    </div>
                  </label>

                  <button
                    id="btn-trigger-search"
                    type="submit"
                    disabled={isSearching || !prompt.trim()}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-xs py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <Search className="w-4 h-4" />
                    {isSearching ? "Consultando..." : "Mapear Squad"}
                  </button>
                </div>
              </form>

              {/* Invite Connection success alert overlay banner */}
              {inviteSuccessMsg && (
                <div id="invite-success-alert" className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-between gap-2 duration-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>{inviteSuccessMsg}</span>
                  </div>
                  <button onClick={() => setInviteSuccessMsg("")} className="text-[10px] font-mono hover:underline uppercase text-indigo-400">fechar</button>
                </div>
              )}

              {/* Status and simulated log for long-running MCP execution */}
              {isSearching && (
                <div id="search-mcp-loading" className="p-6 rounded-xl bg-[#0f172a]/90 border border-slate-800 space-y-4 font-mono">
                  <div className="flex items-center justify-between text-xs text-indigo-400 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>PROCESSO DE BUSCA DA IA ATIVO</span>
                    </div>
                    <span>PASSO {searchStep + 1} DE 4</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${searchStep >= 0 ? 'bg-emerald-500' : 'bg-slate-700'} inline-block`}></span>
                      <span className={searchStep >= 0 ? 'text-slate-300' : 'text-slate-600'}>
                        [MCP-Client] Conectando ao servidor SSE helper e lendo triggers...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${searchStep >= 1 ? 'bg-emerald-500' : 'bg-slate-700'} inline-block`}></span>
                      <span className={searchStep >= 1 ? 'text-slate-300' : 'text-slate-600'}>
                        [Local-DB] Escaneando {allDevelopers.length} desenvolvedores em nossa base...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${searchStep >= 2 ? (incluirWeb ? 'bg-emerald-500' : 'bg-slate-500') : 'bg-slate-700'} inline-block`}></span>
                      <span className={searchStep >= 2 ? 'text-slate-300' : 'text-slate-600'}>
                        {incluirWeb 
                          ? "[Web-Matcher] Consultando Firecrawl API para obter leads do GitHub & Twitter regional correspondentes..." 
                          : "[Web-Matcher] Busca externa desmarcada. Ignorando pesquisa externa."}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${searchStep >= 3 ? 'bg-emerald-500' : 'bg-slate-700'} inline-block`}></span>
                      <span className={searchStep >= 3 ? 'text-slate-300' : 'text-slate-600'}>
                        [Gemini-3.5-flash] Calculando score cognitivo e gerando parecer heurístico...
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(searchStep + 1) * 25}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Show error */}
              {searchError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {searchError}
                </div>
              )}

              {/* Results rendering */}
              {searchResults.length > 0 && (
                <div id="search-results-section" className="space-y-4">
                  {avisoServico && (
                    <div 
                      id="service-advice-card" 
                      className={`p-4 rounded-xl text-xs flex flex-col gap-1.5 shadow-md border ${
                        avisoServico.includes("sucesso") || avisoServico.includes("Ativamos")
                          ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-300"
                          : "bg-amber-500/10 border-amber-500/35 text-amber-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold font-mono">
                        {avisoServico.includes("sucesso") || avisoServico.includes("Ativamos") ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                        ) : (
                          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                        )}
                        <span>
                          {avisoServico.includes("sucesso") || avisoServico.includes("Ativamos")
                            ? "SISTEMA: COGNIÇÃO FIRECRAWL"
                            : "SISTEMA: RECURSO ALTERNATIVO"}
                        </span>
                      </div>
                      <p className="leading-relaxed opacity-90">{avisoServico}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 tracking-wider">
                    <span>RESULTADOS PROPOSTOS ({searchResults.length})</span>
                    <span>ORDENADO POR SCORE FIT</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((match: any, idx: number) => {
                      const matchIdKey = match.nome + "_" + match.fonte;
                      const isLocal = match.fonte === "interno";
                      const pct = Math.round(match.score_ia * 100);

                      return (
                        <div 
                          key={idx} 
                          className="p-5 rounded-xl bg-[#1e293b]/40 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                        >
                          <div>
                            {/* Score & Source badges */}
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono uppercase tracking-wide border ${
                                isLocal 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                              }`}>
                                {isLocal ? "Candidato Local" : "Rastreado na Web"}
                              </span>

                              {/* Progress Dial represented as badge */}
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400 font-mono">Score IA:</span>
                                <span className="text-xs font-bold text-white font-mono bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900">{pct}%</span>
                              </div>
                            </div>

                            {/* Name and Localization */}
                            <h4 className="text-sm font-semibold text-white tracking-tight">{match.nome}</h4>
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-slate-400 mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                <span>{match.localizacao}</span>
                              </div>
                              <span className="text-slate-600 font-sans font-semibold">•</span>
                              <button
                                type="button"
                                onClick={() => handleOpenContactModal(match.nome, match.contato)}
                                className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer transition-colors"
                              >
                                Dados de contato
                              </button>
                            </div>

                            {/* Bio */}
                            <p className="text-xs text-slate-300 mt-2.5 line-clamp-3 italic leading-relaxed">
                              "{match.bio}"
                            </p>

                            {/* Skills Row */}
                            <div className="flex flex-wrap gap-1 mt-3">
                              {match.skills?.map((sk: string, sIdx: number) => (
                                <span 
                                  key={sIdx} 
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>

                            {/* AI Rationale / Why match box */}
                            <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                              <strong className="text-indigo-400 block mb-1 font-sans">Parecer da IA:</strong>
                              {match.motivo}
                            </div>
                          </div>

                          {/* Action Button: Connect */}
                          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-4">
                            <span className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]" title={match.contato}>
                              {match.contato || "Sem contato público"}
                            </span>

                            <button
                              id={`btn-connect-${idx}`}
                              onClick={() => handleConnectWithMatch(match)}
                              disabled={invitingMap[matchIdKey]}
                              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-white font-mono font-medium text-[10px] uppercase py-1.5 px-3 rounded transition flex-shrink-0"
                            >
                              <Send className="w-3 h-3 text-indigo-400" />
                              {invitingMap[matchIdKey] ? "Anotando..." : "Demonstrar Interesse"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Helper Empty state */}
              {!isSearching && searchResults.length === 0 && (
                <div className="p-12 text-center bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                  <Compass className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-xs">Nenhum mapeamento técnico foi realizado ainda nesta sessão.</p>
                  <p className="text-slate-500 text-[11px] mt-1">Preencha o prompt acima para consultar a IA.</p>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Developers Directory (Inspect all users) */}
          {activeTab === "devs" && (
            <div id="tab-viewport-devs" className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-display font-medium text-slate-100">Candidatos Registrados</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Veja todos os desenvolvedores na base e aplique filtros rápidos.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Search filter input */}
                  <div className="relative">
                    <input
                      id="dev-search-filter"
                      type="text"
                      value={devSearchQuery}
                      onChange={(e) => setDevSearchQuery(e.target.value)}
                      placeholder="Filtrar por skill, nome, bio..."
                      className="w-full sm:w-60 pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5" />
                  </div>

                  {/* Location Filter */}
                  <select
                    id="dev-location-select"
                    value={devLocationFilter}
                    onChange={(e) => setDevLocationFilter(e.target.value)}
                    className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Todas">Todas Localidades</option>
                    {availableLocations.map((loc, lIdx) => (
                      <option key={lIdx} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid representation */}
              {filteredDevelopers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDevelopers.map((dev) => (
                    <div 
                      key={dev.id} 
                      className={`p-5 rounded-xl border transition bg-slate-900/40 ${
                        dev.id === currentUser.id 
                          ? "border-indigo-500/45 bg-indigo-950/5" 
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-100">{dev.nome}</h4>
                            {dev.id === currentUser.id && (
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-400/20">Você</span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-slate-400 mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span>{dev.localizacao}</span>
                            </div>
                            <span className="text-slate-600 font-sans font-semibold">•</span>
                            <button
                              type="button"
                              onClick={() => handleOpenContactModal(dev.nome, dev.contato)}
                              className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer transition-colors"
                            >
                              Dados de contato
                            </button>
                          </div>
                        </div>

                        {/* Availability indicator badge */}
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                          dev.disponivel 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}>
                          {dev.disponivel ? "CONFIRMADO/LIVRE" : "OCUPADO"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                        {dev.bio || "Este desenvolvedor ainda não configurou sua biografia profissional."}
                      </p>

                      {/* Stack row */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {dev.skills.map((st, stIdx) => (
                          <span 
                            key={stIdx} 
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400"
                          >
                            {st}
                          </span>
                        ))}
                      </div>

                      {/* Contact row and Quick Action */}
                      <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500 lowercase truncate max-w-[150px]">{dev.contato || "sem contato"}</span>
                        
                        {dev.id !== currentUser.id ? (
                          <button
                            id={`btn-manual-invite-${dev.id}`}
                            onClick={() => handleConnectWithMatch({
                              nome: dev.nome,
                              contato: dev.contato,
                              skills: dev.skills,
                              localizacao: dev.localizacao,
                              bio: dev.bio,
                              score_ia: 0.90,
                              fonte: "interno",
                              motivo: "Match manual selecionado do banco pelo usuário."
                            })}
                            className="text-[10px] text-indigo-400 font-semibold uppercase hover:underline"
                          >
                            Demonstrar Interesse
                          </button>
                        ) : (
                          <button 
                            onClick={() => setActiveTab("profile")}
                            className="text-[10px] text-amber-400 font-semibold uppercase hover:underline"
                          >
                            Editar Meu Registro
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-xs">Nenhum desenvolvedor corresponde aos seus filtros de busca atuais.</p>
                  <button 
                    onClick={() => { setDevSearchQuery(""); setDevLocationFilter("Todas"); }}
                    className="mt-3 text-xs text-indigo-400 hover:underline inline-block font-mono"
                  >
                    Limpar Filtros
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: Registered Connections History (My list) */}
          {activeTab === "connections" && (
            <div id="tab-viewport-connections" className="space-y-6 animate-fade-in">
              
              {/* If a Chat Room is currently selected, render the chat experience instead of lists */}
              {selectedChatConnection ? (
                <div id="chat-viewport-panel" className="bg-[#0f172a]/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between min-h-[500px]">
                  
                  {/* Chat Header */}
                  <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedChatConnection(null)}
                        className="p-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                      </button>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">
                          Bate-papo com {
                            selectedChatConnection.usuarioId === currentUser.id 
                              ? selectedChatConnection.nomePerfil 
                              : (selectedChatConnection.usuarioRemetente?.nome || selectedChatConnection.nomePerfil)
                          }
                        </h3>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Canal de Comunicação Oficial Criado</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => fetchConnections()}
                      className="text-[10px] font-mono whitespace-nowrap bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded border border-indigo-500/25 transition"
                    >
                      Sincronizar Mensagens
                    </button>
                  </div>

                  {/* Message Stream */}
                  <div className="p-4 space-y-3 overflow-y-auto max-h-[350px] flex flex-col min-h-[280px]">
                    {selectedChatConnection.mensagens && selectedChatConnection.mensagens.length > 0 ? (
                      selectedChatConnection.mensagens.map((msg: any, mIdx: number) => {
                        const isMe = msg.senderId === currentUser.id;
                        const isSystem = msg.senderId === "system";

                        if (isSystem) {
                          return (
                            <div key={mIdx} className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-indigo-300 leading-relaxed text-center max-w-lg mx-auto italic">
                              {msg.texto}
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={mIdx} 
                            className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                          >
                            <span className="text-[9px] text-slate-500 mb-0.5 font-mono">
                              {msg.senderNome} • {new Date(msg.dataEnvio).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className={`p-3 rounded-2xl text-xs rounded-tr-none shadow ${
                              isMe 
                                ? 'bg-indigo-600 text-white rounded-tr-none rounded-br-3xl' 
                                : 'bg-slate-800 text-slate-200 rounded-tl-none rounded-bl-3xl border border-slate-700/60'
                            }`}>
                              <p className="whitespace-pre-line leading-relaxed">{msg.texto}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="my-auto text-center text-slate-500 text-xs py-8">
                        Nenhuma mensagem enviada nesta sala ainda.
                      </div>
                    )}
                  </div>

                  {/* Chat Input form */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
                    <input
                      required
                      type="text"
                      value={chatMessageText}
                      onChange={(e) => setChatMessageText(e.target.value)}
                      placeholder="Envie uma mensagem de texto técnico ou contato inicial..."
                      className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>
              ) : (
                <>
                  {/* Default Navigation and listings */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                    <div>
                      <h3 className="text-base font-display font-medium text-slate-100">Controles de Conexão</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Gerencie solicitações enviadas de parceria, analise as recebidas e inicie chats.</p>
                    </div>

                    {/* Sub Tab Switcher */}
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                      <button
                        onClick={() => { setActiveConnectionSubTab("received"); }}
                        className={`px-4 py-1.5 rounded-md font-medium transition ${
                          activeConnectionSubTab === "received"
                            ? "bg-indigo-600 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Interesses Recebidos ({myReceivedConnections.length})
                        {myReceivedConnections.filter(m => m.status === "pendente").length > 0 && (
                          <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                        )}
                      </button>
                      <button
                        onClick={() => { setActiveConnectionSubTab("sent"); }}
                        className={`px-4 py-1.5 rounded-md font-medium transition ${
                          activeConnectionSubTab === "sent"
                            ? "bg-indigo-600 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Enviados por Você ({myConnections.length})
                      </button>
                    </div>
                  </div>

                  {/* 1. RECEIVED SUB-TAB VIEWPORT */}
                  {activeConnectionSubTab === "received" && (
                    <div className="space-y-4">
                      {myReceivedConnections.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {myReceivedConnections.map((conn) => {
                            const sender = conn.usuarioRemetente;
                            const isPending = conn.status === "pendente";
                            const isAccepted = conn.status === "aceito";
                            const isRejected = conn.status === "rejeitado";

                            return (
                              <div 
                                key={conn.id} 
                                className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                                  isAccepted 
                                    ? "bg-emerald-950/10 border-emerald-500/20" 
                                    : isRejected
                                      ? "bg-slate-900/10 border-slate-800 opacity-65"
                                      : "bg-[#1e293b]/30 border-slate-800"
                                }`}
                              >
                                <div>
                                  {/* Upper Metadata */}
                                  <div className="flex items-center justify-between mb-3 border-b border-slate-800/40 pb-2 text-[10px] font-mono text-slate-400">
                                    <span className={`font-semibold uppercase tracking-wider ${
                                      isAccepted ? "text-emerald-400" : isRejected ? "text-slate-500" : "text-amber-400"
                                    }`}>
                                      {isAccepted ? "● Aceito" : isRejected ? "Recusado" : "● Novo Convite Pendente"}
                                    </span>
                                    <span>
                                      {new Date(conn.dataCriacao).toLocaleDateString("pt-BR")}
                                    </span>
                                  </div>

                                  {/* Sender Profile Outline */}
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-white">
                                      {sender ? sender.nome : conn.nomePerfil}
                                    </h4>
                                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                      <span>{sender ? sender.localizacao : conn.localizacaoPerfil}</span>
                                    </div>
                                  </div>

                                  {/* Intention statement rationale */}
                                  <div className="mt-3 p-3 bg-slate-950/55 rounded-lg border border-slate-800 text-xs">
                                    <p className="text-[10px] uppercase font-mono tracking-wide text-slate-400 mb-1">Motivo do Interesse:</p>
                                    <p className="text-slate-300 italic">"{conn.motivo || "Desenvolvedor local marcou interesse em sua experiência tecnica."}"</p>
                                  </div>

                                  {/* Contact channel details */}
                                  {isAccepted && (
                                    <div className="mt-3 p-2 bg-emerald-500/10 rounded border border-emerald-500/15 text-xs text-emerald-300">
                                      <span className="block text-[9px] uppercase font-mono tracking-wide text-emerald-400">Meio de Contato Compartilhado:</span>
                                      {sender && sender.contato && (sender.contato.startsWith("http://") || sender.contato.startsWith("https://") || sender.contato.startsWith("mailto:") || sender.contato.startsWith("tel:")) ? (
                                        <a 
                                          href={sender.contato} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="text-emerald-350 hover:text-emerald-250 mt-1 inline-flex items-center gap-1 font-mono break-all hover:underline"
                                        >
                                          {sender.contato}
                                          <ExternalLink className="w-3 h-3 text-emerald-300" />
                                        </a>
                                      ) : conn.contatoPerfil && (conn.contatoPerfil.startsWith("http://") || conn.contatoPerfil.startsWith("https://") || conn.contatoPerfil.startsWith("mailto:") || conn.contatoPerfil.startsWith("tel:")) ? (
                                        <a 
                                          href={conn.contatoPerfil} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="text-emerald-350 hover:text-emerald-250 mt-1 inline-flex items-center gap-1 font-mono break-all hover:underline"
                                        >
                                          {conn.contatoPerfil}
                                          <ExternalLink className="w-3 h-3 text-emerald-300" />
                                        </a>
                                      ) : (
                                        <span className="font-mono mt-0.5 block break-all">{sender ? sender.contato : conn.contatoPerfil}</span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Dynamic action buttons */}
                                <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                                  {sender ? (
                                    <button
                                      onClick={() => setSelectedUserDetail({ conn, user: sender })}
                                      className="inline-flex items-center gap-1.5 text-[10.5px] uppercase font-mono text-indigo-400 hover:underline"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      Inspecionar Perfil
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-500">Perfil web estático</span>
                                  )}

                                  <div className="flex items-center gap-2">
                                    {isPending && (
                                      <>
                                        <button
                                          onClick={() => handleRejectConnection(conn.id)}
                                          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 hover:text-rose-400 text-slate-300 transition text-[10px] uppercase font-mono"
                                        >
                                          Recusar
                                        </button>
                                        <button
                                          onClick={() => handleAcceptConnection(conn.id)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition text-[10px] uppercase font-semibold font-mono"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          Aceitar
                                        </button>
                                      </>
                                    )}

                                    {isAccepted && (
                                      <button
                                        onClick={() => setSelectedChatConnection(conn)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition text-[10px] uppercase font-semibold font-mono animate-pulse"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Abrir Chat
                                      </button>
                                    )}

                                    {isRejected && (
                                      <span className="text-[10px] text-slate-500 font-mono">Recusado pelo usuário</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-12 text-center bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                          <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400 text-xs">Você não recebeu solicitações de match técnico ainda.</p>
                          <p className="text-slate-500 text-[11px] mt-1">Sua disponibilidade está ativa! Continue refinando seu perfil.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. SENT SUB-TAB VIEWPORT */}
                  {activeConnectionSubTab === "sent" && (
                    <div className="space-y-4">
                      {myConnections.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {myConnections.map((conn) => {
                            const isLocal = conn.fonte === "interno";
                            const scorePct = Math.round(conn.scoreIa * 100);
                            const isAccepted = conn.status === "aceito";
                            const isRejected = conn.status === "rejeitado";

                            return (
                              <div 
                                key={conn.id} 
                                className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between animate-fade-in"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-3 border-b border-slate-800/50 pb-2 text-[10px] font-mono">
                                    <span className={`uppercase px-2 py-0.5 rounded-full ${
                                      isLocal 
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                    }`}>
                                      {isLocal ? "Candidato Local" : "Mapeado Web"}
                                    </span>
                                    <span className="text-slate-500">
                                      {new Date(conn.dataCriacao).toLocaleDateString("pt-BR")}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-white">{conn.nomePerfil}</h4>
                                    
                                    {/* Status Indicator */}
                                    <span className={`text-[10px] font-mono font-bold uppercase ${
                                      isAccepted 
                                        ? "text-emerald-400" 
                                        : isRejected 
                                          ? "text-rose-400" 
                                          : "text-amber-400"
                                    }`}>
                                      {isAccepted ? "Aceito!" : isRejected ? "Recusado" : "Pendente"}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {conn.localizacaoPerfil}
                                  </p>

                                  {conn.motivo && (
                                    <div className="mt-2.5 p-2.5 bg-slate-950/40 rounded border border-slate-800 text-[10.5px] text-slate-400 leading-relaxed italic">
                                      "{conn.motivo}"
                                    </div>
                                  )}

                                  {/* Contact information details box */}
                                  <div className="mt-3 p-2 bg-indigo-500/5 rounded border border-indigo-500/10 text-xs">
                                    <span className="text-indigo-300 block text-[10px] uppercase font-mono tracking-wider">Canal de Contato</span>
                                    {conn.contatoPerfil && (conn.contatoPerfil.startsWith("http://") || conn.contatoPerfil.startsWith("https://") || conn.contatoPerfil.startsWith("mailto:") || conn.contatoPerfil.startsWith("tel:")) ? (
                                      <a 
                                        href={conn.contatoPerfil} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-emerald-400 hover:text-emerald-300 mt-1 inline-flex items-center gap-1 font-mono break-all hover:underline"
                                      >
                                        {conn.contatoPerfil}
                                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                                      </a>
                                    ) : (
                                      <span className="text-slate-200 mt-0.5 block font-mono break-all">{conn.contatoPerfil}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                                  <span className="text-[11px] font-semibold text-slate-300 font-mono">
                                    Fit IA: {scorePct}%
                                  </span>

                                  <div className="flex items-center gap-2">
                                    {isAccepted && (
                                      <button
                                        onClick={() => setSelectedChatConnection(conn)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition text-[10px] uppercase font-semibold font-mono animate-pulse"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Conversar
                                      </button>
                                    )}

                                    <button
                                      id={`btn-remove-connection-${conn.id}`}
                                      onClick={() => handleRemoveConnection(conn.id)}
                                      className="inline-flex items-center gap-1 py-1 px-2.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition text-[10px] font-mono uppercase border border-rose-500/10"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Remover/Cancelar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-12 text-center bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                          <Link2 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400 text-xs">Você não registrou interesses ou enviou convites ativos para parceiros ainda.</p>
                          <p className="text-slate-500 text-[11px] mt-1">Preencha um prompt na IA Matchmaker ou aperte "Demonstrar Interesse" no Banco de Talentos!</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* OVERLAY DIALOG / MODAL: Inspect Received User Detail Profile */}
              {selectedUserDetail && (
                <div id="modal-user-detail" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
                  <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
                    
                    {/* Header */}
                    <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-display font-bold text-white text-base">Análise de Candidato Interessado</h3>
                      </div>
                      <button 
                        onClick={() => setSelectedUserDetail(null)}
                        className="text-slate-400 hover:text-white transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                      {/* Name & Location */}
                      <div>
                        <h4 className="text-lg font-bold text-white tracking-tight">{selectedUserDetail.user.nome}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {selectedUserDetail.user.localizacao}
                        </p>
                      </div>

                      {/* Bio */}
                      <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-300 text-xs leading-relaxed">
                        <strong className="text-[10px] uppercase font-mono block tracking-wide text-slate-500 mb-1">Biografia Profissional:</strong>
                        "{selectedUserDetail.user.bio || 'Este desenvolvedor não incluiu uma biografia.'}"
                      </div>

                      {/* Skills Stack */}
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wide text-slate-500 block mb-1.5">Stack de Especialidades:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedUserDetail.user.skills && selectedUserDetail.user.skills.map((sk: string, sIdx: number) => (
                            <span key={sIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Intent rationale context */}
                      <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs">
                        <span className="text-indigo-400 font-semibold block text-[10px] uppercase font-mono tracking-wide">Texto e Justificativa do Match de IA:</span>
                        <p className="text-slate-300 italic mt-1 bg-slate-950/40 p-2.5 rounded border border-slate-850">"{selectedUserDetail.conn.motivo}"</p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
                      <span className="text-[10.5px] font-mono text-slate-500 trunate max-w-[150px]">{selectedUserDetail.user.contato}</span>

                      <div className="flex items-center gap-2">
                        {selectedUserDetail.conn.status === "pendente" && (
                          <>
                            <button
                              onClick={() => handleRejectConnection(selectedUserDetail.conn.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-705 text-slate-300 text-xs font-mono uppercase transition"
                            >
                              Recusar
                            </button>
                            <button
                              onClick={() => handleAcceptConnection(selectedUserDetail.conn.id)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono uppercase transition flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" />
                              Aceitar e Conversar
                            </button>
                          </>
                        )}
                        {selectedUserDetail.conn.status === "aceito" && (
                          <button
                            onClick={() => {
                              setSelectedChatConnection(selectedUserDetail.conn);
                              setSelectedUserDetail(null);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold font-mono uppercase transition flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Abrir Conversa
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* OVERLAY DIALOG / MODAL: LinkedIn-Style "Dados de contato" Detail Panel */}
              {contactModalData && (
                <div id="modal-contact-details" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden text-slate-100">
                    
                    {/* Header */}
                    <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
                      <h3 className="font-display font-semibold text-slate-100 text-base">Dados de contato</h3>
                      <button 
                        onClick={() => setContactModalData(null)}
                        className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800/50 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                      
                      {/* Section: Profile Link Row */}
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                          {contactModalData.perfilUrl.includes("linkedin") ? (
                            <Linkedin className="w-5 h-5 text-[#0a66c2]" />
                          ) : (
                            <Globe className="w-5 h-5 text-indigo-400" />
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-xs text-slate-400 font-sans font-semibold">Perfil profissional</p>
                          <a 
                            href={contactModalData.perfilUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-400 hover:text-indigo-200 font-mono text-xs hover:underline block break-all font-semibold"
                          >
                            {contactModalData.displayUrl}
                          </a>
                        </div>
                      </div>

                      {/* Section: Email */}
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-xs text-slate-400 font-sans font-semibold">E-mail</p>
                          <a 
                            href={`mailto:${contactModalData.email}`}
                            className="text-indigo-400 hover:text-indigo-200 font-mono text-xs hover:underline block break-all font-semibold"
                          >
                            {contactModalData.email}
                          </a>
                        </div>
                      </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 border-t border-slate-800/80 flex justify-end gap-3 bg-slate-900/40">
                      <button
                        onClick={() => {
                          const contactText = `Nome: ${contactModalData.nome}\nPerfil: ${contactModalData.perfilUrl}\nE-mail: ${contactModalData.email}`;
                          navigator.clipboard.writeText(contactText).then(() => {
                            const originalDisplay = contactModalData.displayUrl;
                            setContactModalData({
                              ...contactModalData,
                              displayUrl: "Dados Copiados para Área de Transferência!"
                            });
                            setTimeout(() => {
                              setContactModalData(prev => prev ? { ...prev, displayUrl: originalDisplay } : null);
                            }, 1800);
                          });
                        }}
                        className="px-4 py-2 text-xs font-mono font-medium rounded-full border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer"
                      >
                        {contactModalData.displayUrl === "Dados Copiados para Área de Transferência!" ? "✓ Copiado!" : "Copiar Dados"}
                      </button>
                      <button
                        onClick={() => setContactModalData(null)}
                        className="px-4 py-2 text-xs font-mono font-medium rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: Profile Editor */}
          {activeTab === "profile" && (
            <div id="tab-viewport-profile">
              <UserProfile 
                currentUser={currentUser} 
                onProfileUpdate={handleProfileUpdated} 
              />
            </div>
          )}

          {/* TAB 5: Firecrawl Sandbox Diagnostics */}
          {activeTab === "firecrawl-lab" && (
            <div id="tab-viewport-firecrawl" className="space-y-6">
              
              {/* Informative Header */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 mt-0.5">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-bold text-slate-100 flex items-center gap-2">
                        Laboratório & Diagnóstico Firecrawl
                        <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold animate-pulse">SISTEMA ATIVO</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                        Validador interativo para crawling e scraping profundo de contas externas. Teste o mapeamento ao vivo buscando seus perfis ou inserindo termos de busca.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                    <span className="text-[11px] font-mono text-slate-300 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/60">
                      API Status: <strong className="text-emerald-400">Excelente</strong>
                    </span>
                  </div>
                </div>

                {/* Educational Alert */}
                <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/60 text-[11.5px] text-slate-400 leading-relaxed space-y-2.5">
                  <p>
                    💡 <strong className="text-indigo-400 font-sans">Esclarecimento de Comportamento & Resiliência:</strong>
                  </p>
                  <p>
                    O aviso <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">SISTEMA: COGNIÇÃO FIRECRAWL</span> confirma que as informações reais das redes dos desenvolvedores foram extraídas com sucesso na web pública via seu token Firecrawl!
                  </p>
                  <p>
                    Se o sistema retornou um congestionamento momentâneo do Gemini (como o erro 503), não se preocupe: a nossa <strong className="text-slate-250">Camada de Failover Resiliente</strong> entra em ação imediatamente, chaveando para o resolvedor local mEncontre para manter o seu fluxo de cadastro, análise técnica e convites de matchmaker 100% ativo!
                  </p>
                </div>
              </div>

              {/* Main Panel Controls */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 shadow-lg space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">Simulação Rápida de Perfis</h4>
                  <p className="text-xs text-slate-500 mb-4">Selecione uma das suas contas de teste abaixo para ver o Firecrawl raspando e organizando seus dados em tempo real:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* LinkedIn Button */}
                    <button
                      type="button"
                      disabled={labLoading}
                      onClick={() => handleRunLabTest("https://www.linkedin.com/in/manuel-de-deus-694956199/")}
                      className="group flex items-center justify-between p-4 rounded-xl bg-[#0077b5]/10 border border-[#0077b5]/20 hover:border-[#0077b5]/40 text-left transition text-xs font-mono disabled:opacity-50"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#0077b5] uppercase font-bold tracking-wider">Scrape LinkedIn</span>
                        <p className="text-slate-200 font-semibold text-xs font-sans">Manuel de Deus</p>
                        <p className="text-slate-400 text-[10.5px]">in/manuel-de-deus-694956199/</p>
                      </div>
                      <span className="p-2 rounded-lg bg-[#0077b5]/10 text-[#0077b5] group-hover:bg-[#0077b5]/25 transition">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </button>

                    {/* GitHub Button */}
                    <button
                      type="button"
                      disabled={labLoading}
                      onClick={() => handleRunLabTest("https://github.com/nicolemos56")}
                      className="group flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition text-xs font-mono disabled:opacity-50"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Scrape GitHub</span>
                        <p className="text-slate-200 font-semibold text-xs font-sans">Manuel (nicolemos56)</p>
                        <p className="text-slate-400 text-[10.5px]">github.com/nicolemos56</p>
                      </div>
                      <span className="p-2 rounded-lg bg-slate-900 text-slate-400 group-hover:bg-slate-800 transition">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Custom Search Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRunLabTest();
                  }}
                  className="space-y-3.5 pt-4 border-t border-slate-800/80"
                >
                  <label htmlFor="lab-input-field" className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest">
                    Ou insira qualquer URL / Termo Customizado
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        id="lab-input-field"
                        type="text"
                        placeholder="Ex: https://github.com/nicolemos56 ou termo de busca 'React Luanda'"
                        value={labInput}
                        onChange={(e) => setLabInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                      />
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={labLoading}
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-semibold font-mono tracking-wider transition-all shadow-md hover:shadow-indigo-500/10 flex items-center justify-center gap-2 shrink-0 disabled:cursor-not-allowed"
                    >
                      {labLoading ? (
                        <>
                          <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>COMPUTANDO...</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-4 h-4" />
                          <span>RODAR EXTRAÇÃO</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Error Box */}
                {labError && (
                  <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Falha no Processamento:</span>
                      <p className="mt-1 opacity-90">{labError}</p>
                    </div>
                  </div>
                )}

                {/* Loading State Skeleton */}
                {labLoading && (
                  <div className="p-8 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                    <div className="p-3 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 animate-bounce">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <p className="text-xs text-slate-200 font-semibold font-mono">Buscando via API Firecrawl...</p>
                      <p className="text-[10px] text-slate-500">Fazendo requisição direta com tokens de autorização seguros e baixando a árvore de elementos DOM.</p>
                    </div>
                  </div>
                )}

                {/* Results Screen */}
                {labResult && (
                  <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60 transition-all duration-300">
                    
                    {/* Header bar / Tabs selector */}
                    <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-bold text-emerald-400 uppercase px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/15">
                          {labResult.method === "scrape" ? "MÉTODO: SCRAPE" : "MÉTODO: SEARCH"}
                        </span>
                        <span className="text-slate-500 text-[11px] truncate max-w-xs inline-block">
                          {labResult.target || labResult.query}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setLabActiveSubTab("card")}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            labActiveSubTab === "card" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Visualização
                        </button>
                        <button
                          type="button"
                          onClick={() => setLabActiveSubTab("markdown")}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            labActiveSubTab === "markdown" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Markdown
                        </button>
                        <button
                          type="button"
                          onClick={() => setLabActiveSubTab("json")}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            labActiveSubTab === "json" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Raw JSON
                        </button>
                      </div>
                    </div>

                    {/* Content views */}
                    <div className="p-5">
                      
                      {/* VIEW 1: Card view styled */}
                      {labActiveSubTab === "card" && (
                        <div className="space-y-4">
                          {labResult.method === "scrape" ? (
                            <div className="space-y-4">
                              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                                <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-center flex items-center justify-center shrink-0 w-12 h-12">
                                  <User className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-semibold text-slate-100 text-sm">
                                    {labResult.data?.metadata?.title || "Perfil Encontrado"}
                                  </h4>
                                  <p className="text-xs text-indigo-400 font-mono flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" />
                                    <a href={labResult.target} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                      {labResult.target}
                                    </a>
                                  </p>
                                  <p className="text-xs text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-800/80">
                                    {labResult.data?.metadata?.description || "Sem biografia descritiva extraída de metatags."}
                                  </p>
                                </div>
                              </div>
                              <div className="p-4 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-2">
                                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">Métrica de Extração</span>
                                <p className="text-xs text-slate-350">
                                  O markdown gerado pelo Firecrawl possui <strong className="text-emerald-400">{labResult.data?.markdown?.length || 0}</strong> caracteres estruturados de elementos HTML cruciais.
                                </p>
                              </div>

                              {/* AI Extraction tool integration */}
                              <div className="p-5 border border-indigo-500/35 rounded-xl bg-indigo-950/25 space-y-4">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                                  <span className="text-xs font-semibold font-mono text-slate-100 uppercase tracking-wider">Extração Inteligente de Candidatos (IA)</span>
                                </div>
                                <p className="text-[11.5px] text-slate-300 leading-normal">
                                  Esta URL raspada contém uma lista de programadores/talentos (como BeBee ou diretórios de fórum)? Faça o parsing inteligente com o Gemini para reconhecer cada desenvolvedor nesta página e poder extrair seus canais de comunicação com 1 clique!
                                </p>
                                
                                <button
                                  type="button"
                                  onClick={handleExtractSubTalents}
                                  disabled={isExtractingTalents}
                                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white font-mono text-xs font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-indigo-500/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isExtractingTalents ? (
                                    <>
                                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                      <span>MAPEANDO CÉLULAS DE ATRIBUTO DE IA...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Cpu className="w-4 h-4" />
                                      <span>DETECTAR CANDIDATOS NA PÁGINA COM GEMINI IA</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {extractionError && (
                                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                                  <strong>Falha na Extração:</strong> {extractionError}
                                </div>
                              )}

                              {/* List of extracted subprofiles with IA */}
                              {extractedTalents.length > 0 && (
                                <div className="space-y-3 pt-3">
                                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    CANDIDATOS EXTRAÍDOS POR COGNIÇÃO IA ({extractedTalents.length})
                                  </span>

                                  <div className="grid grid-cols-1 gap-3">
                                    {extractedTalents.map((talent: any, tIdx: number) => {
                                      const isDeepScrapingThis = deepProfilingUrl === talent.perfilUrl;
                                      return (
                                        <div 
                                          key={tIdx} 
                                          className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                                        >
                                          <div className="flex justify-between items-start gap-2">
                                            <div>
                                              <h5 className="font-semibold text-slate-100 text-sm font-sans flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-indigo-400" />
                                                {talent.nome}
                                              </h5>
                                              <p className="text-xs text-indigo-300 mt-0.5">{talent.titulo}</p>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                                              {talent.localizacao || "Remoto / Web Pública"}
                                            </span>
                                          </div>

                                          {talent.bio && (
                                            <p className="text-[11px] text-slate-400 leading-relaxed italic border-l border-slate-700 pl-2.5">
                                              "{talent.bio}"
                                            </p>
                                          )}

                                          <div className="flex flex-wrap gap-1">
                                            {talent.skills?.map((sk: string, sIdx: number) => (
                                              <span 
                                                key={sIdx} 
                                                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-450 border border-slate-900"
                                              >
                                                {sk}
                                              </span>
                                            ))}
                                          </div>

                                          <div className="pt-3 border-t border-slate-850/60 flex flex-col md:flex-row gap-2 justify-between items-stretch md:items-center text-xs">
                                            <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs block mb-1 md:mb-0" title={talent.perfilUrl}>
                                              Página: {talent.perfilUrl}
                                            </div>

                                            <button
                                              type="button"
                                              onClick={() => handleDeepProfileSubTalent(talent.perfilUrl)}
                                              disabled={isDeepProfiling}
                                              className="inline-flex items-center justify-center gap-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-705 text-white text-[10.5px] font-mono font-medium py-1.5 px-3 rounded transition flex-shrink-0"
                                            >
                                              {isDeepScrapingThis && isDeepProfiling ? (
                                                <>
                                                  <span className="w-3 h-3 border-2 border-slate-200/20 border-t-indigo-400 rounded-full animate-spin"></span>
                                                  <span>LENDO CONTATO...</span>
                                                </>
                                              ) : (
                                                <>
                                                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                                  <span>RASTREAR DISPONIBILIDADE</span>
                                                </>
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Deep Profile Inspection Dashboard */}
                              {isDeepProfiling && !scrapedDeepProfile && (
                                <div className="p-6 rounded-xl border border-indigo-500/20 bg-indigo-950/10 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                                  <div className="p-2.5 bg-indigo-500/10 rounded-full text-indigo-400">
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-100 font-mono">Indexando Perfil Individual em Segundo Plano...</p>
                                    <p className="text-[10.5px] text-slate-450 font-mono truncate max-w-md">Scrape de alta precisão via Firecrawl em {deepProfilingUrl}</p>
                                  </div>
                                </div>
                              )}

                              {deepProfileError && (
                                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-300 text-xs font-mono">
                                  <strong>Aviso:</strong> Falha de leitura de subpágina profunda: {deepProfileError}
                                </div>
                              )}

                              {scrapedDeepProfile && (
                                <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/5 space-y-4 shadow-inner">
                                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                      <span className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wide">PERFIL PROFUNDO COMPILADO COM SUCESSO</span>
                                    </div>
                                    <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                                      Dados Sincronizados
                                    </span>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="text-sm font-bold text-white font-sans">{scrapedDeepProfile.nome}</h4>
                                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-indigo-300 mt-1">
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                          <span>{scrapedDeepProfile.localizacao}</span>
                                        </div>
                                        <span className="text-slate-600 font-sans font-semibold">•</span>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenContactModal(scrapedDeepProfile.nome, scrapedDeepProfile.contato || scrapedDeepProfile.perfilUrl)}
                                          className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer transition-colors"
                                        >
                                          Dados de contato
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">Resumo descritivo & Skills mapeadas:</span>
                                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                                        {scrapedDeepProfile.bio}
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                      {scrapedDeepProfile.skills?.map((sk: string, sIdx: number) => (
                                        <span 
                                          key={sIdx} 
                                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                                        >
                                          {sk}
                                        </span>
                                      ))}
                                    </div>

                                    <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/15 flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                                      <Send className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                      <div className="space-y-1">
                                        <span className="font-semibold text-slate-100">Canal de Comunicação Identificado para Vinculação:</span>
                                        <p className="mt-1 font-mono text-indigo-300 bg-slate-950 p-1.5 rounded text-[11px] truncate max-w-sm" title={scrapedDeepProfile.contato}>
                                          {scrapedDeepProfile.contato || "Nenhum link. Usando URL base"}
                                        </p>
                                        <p className="text-[10px] text-slate-550 mt-1.5">
                                          Este link será amarrado ao botão de ação <strong className="text-slate-300">"Demonstrar Interesse"</strong> na aba principal, permitindo redirecionar e iniciar contatos reais!
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {mappedSuccessMsg && (
                                    <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-mono">
                                      {mappedSuccessMsg}
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={handleSaveScrapedProfileToMatchmaker}
                                    disabled={isSavingMappedUser}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold py-2.5 px-4 rounded-lg shadow-lg active:scale-95 transition-all"
                                  >
                                    <Sparkles className="w-4 h-4" />
                                    <span>VINCULAR E INTEGRAR AO IA MATCHMAKER</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider block">Resultados de Consulta da Web ({Array.isArray(labResult.data) ? labResult.data.length : 0})</span>
                              {Array.isArray(labResult.data) && labResult.data.map((item: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all space-y-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <h5 className="font-semibold text-slate-200 text-xs font-sans">{item.title || "Resultado"}</h5>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-xs hover:underline flex items-center gap-1 shrink-0 font-mono">
                                      Acessar <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-normal">{item.description}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* VIEW 2: Raw Markdown document */}
                      {labActiveSubTab === "markdown" && (
                        <div className="max-h-[350px] overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 whitespace-pre-wrap leading-relaxed select-all">
                          {labResult.data?.markdown || "O método de pesquisa (search) não retorna markdown de página única por padrão. Teste usar um dos botões rápidos acima (LinkedIn ou GitHub URL) para raspar a página e recuperar o documento Markdown completo!"}
                        </div>
                      )}

                      {/* VIEW 3: Complete Raw API response JSON */}
                      {labActiveSubTab === "json" && (
                        <div className="max-h-[350px] overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre leading-relaxed scrollbar-thin select-all">
                          {JSON.stringify(labResult, null, 2)}
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>

    </main>
  );
}
