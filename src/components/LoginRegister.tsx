/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Usuario } from "../types";
import { LogIn, UserPlus, Sparkles, Check, ChevronRight } from "lucide-react";

interface LoginRegisterProps {
  onLoginSuccess: (user: Usuario) => void;
}

export default function LoginRegister({ onLoginSuccess }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Registration Fields
  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [localizacao, setLocalizacao] = useState("Luanda, Angola");
  const [contato, setContato] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, preencha o email e senha.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro de credenciais.");
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nome) {
      setError("Por favor, preencha Nome, Email e Senha.");
      return;
    }

    setError("");
    setLoading(true);

    // Convert comma-separated string to list
    const skills = skillsText
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          password,
          bio,
          skills,
          localizacao,
          contato,
          disponivel: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao registrar.");
      }

      // Automatically authenticate on successful registration
      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || "Falha ao registrar conta.");
    } finally {
      setLoading(false);
    }
  };

  // Demo Profiles Shortcut
  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
    
    // Auto submit in next render or directly fetch
    setLoading(true);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: demoEmail, password: "password123" }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then(e => { throw e; });
        return res.json();
      })
      .then((data) => {
        onLoginSuccess(data);
      })
      .catch((err) => {
        setError(err.message || "Erro no login de teste.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div id="login-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[580px] rounded-2xl overflow-hidden bg-[#1e293b]/40 border border-slate-800 backdrop-blur-md">
      
      {/* Left side: branding/welcome banner */}
      <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 border-r border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-indigo-400 mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Fazer Matches Inteligentes
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            Forge<span className="text-indigo-400">Match</span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            A plataforma de parcerias para desenvolvedores, criadores e engenheiros. Encontre colaboradores locais ou mapeie perfis externos na internet usando inteligência artificial de ponta.
          </p>
        </div>

        {/* Value props */}
        <div className="mt-12 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Matchmaker de Nova Geração</h4>
              <p className="text-xs text-slate-400 mt-0.5">Prompt em linguagem natural avaliado severamente pelo Gemini.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Busca local integrada à Web</h4>
              <p className="text-xs text-slate-400 mt-0.5">Combine talentos do banco local com perfis externos em redes sociais.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 font-mono text-slate-500 text-[10px] flex justify-between">
          <span>SISTEMA DE MATCHMAKING v1.0</span>
          <span>POWERED BY GEMINI AI</span>
        </div>
      </div>

      {/* Right side: standard sign-up/login form */}
      <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
        
        {/* State Toggle Buttons */}
        <div className="flex bg-slate-900/60 p-1 rounded-lg border border-slate-800 max-w-xs mb-8">
          <button
            id="toggle-login"
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              isLogin
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Acessar Conta
          </button>
          <button
            id="toggle-register"
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              !isLogin
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Cadastrar-se
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@forgematch.ao"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none transition text-slate-100 placeholder-slate-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha secreta"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 outline-none transition text-slate-100 placeholder-slate-600 text-sm"
              />
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-indigo-600/15"
            >
              {loading ? "Carregando..." : "Entrar no ForgeMatch"}
              <LogIn className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Nome Completo
                </label>
                <input
                  id="reg-nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-4 py-2 rounded-lg bg-slate-950/60 border border-slate-800 focus:border-indigo-500 outline-none transition text-slate-100 text-sm placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  E-mail institucional/pessoal
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dev@exemplo.com"
                  className="w-full px-4 py-2 rounded-lg bg-slate-950/60 border border-slate-800 focus:border-indigo-500 outline-none transition text-slate-100 text-sm placeholder-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Senha
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha secreta"
                  className="w-full px-4 py-2 rounded-lg bg-slate-950/60 border border-slate-800 focus:border-indigo-500 outline-none transition text-slate-100 text-sm placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Localização
                </label>
                <input
                  id="reg-loc"
                  type="text"
                  required
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Ex: Luanda, Angola"
                  className="w-full px-4 py-2 rounded-lg bg-slate-950/60 border border-slate-800 focus:border-indigo-500 outline-none transition text-slate-100 text-sm placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Como entrar em contato (Link de Rede Social / Email)
              </label>
              <input
                id="reg-contato"
                type="text"
                required
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="Ex: github.com/seuusuario ou twitter.com/seutwitter"
                className="w-full px-4 py-2 rounded-lg bg-slate-950/60 border border-slate-800 focus:border-indigo-500 outline-none transition text-slate-100 text-sm placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Suas Principais Habilidades (Separadas por vírgula)
              </label>
              <input
                id="reg-skills"
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Ex: React, Node.js, Typescript, Tailwind"
                className="w-full px-4 py-2 rounded-lg bg-slate-950/60 border border-slate-800 focus:border-indigo-500 outline-none transition text-slate-100 text-sm placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Breve Biografia / Mini Currículo
              </label>
              <textarea
                id="reg-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Escreva quem é você, seus interesses e o tipo de hacker com quem quer colaborar..."
                className="w-full px-4 py-2 rounded-lg bg-slate-950/60 border border-slate-800 focus:border-indigo-500 outline-none transition text-slate-100 text-sm resize-none placeholder-slate-600"
              />
            </div>

            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-indigo-600/15"
            >
              {loading ? "Registrando..." : "Criar Meu Perfil"}
              <UserPlus className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Demo Profiles Shortcut (Highly aesthetic cards for fast onboarding) */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Explorar sem registro (Contas de Teste)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              id="demo-user-andrade"
              onClick={() => handleDemoLogin("andrade@forgematch.ao")}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a]/80 hover:bg-[#1e293b]/70 border border-slate-800/80 text-left transition group active:scale-[0.98]"
            >
              <div>
                <p className="text-xs font-semibold text-slate-200">Andrade Silva</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Frontend • Luanda, Angola</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
            </button>

            <button
              id="demo-user-claudio"
              onClick={() => handleDemoLogin("claudio@forgematch.ao")}
              disabled={loading}
              className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a]/80 hover:bg-[#1e293b]/70 border border-slate-800/80 text-left transition group active:scale-[0.98]"
            >
              <div>
                <p className="text-xs font-semibold text-slate-200">Cláudio Santos</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Backend & AI • Luanda, Angola</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
