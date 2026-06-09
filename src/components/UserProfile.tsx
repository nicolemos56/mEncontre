/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Usuario } from "../types";
import { User, MapPin, Globe, Check, Save, Flame, HelpCircle } from "lucide-react";

interface UserProfileProps {
  currentUser: Usuario;
  onProfileUpdate: (updatedUser: Usuario) => void;
}

export default function UserProfile({ currentUser, onProfileUpdate }: UserProfileProps) {
  const [nome, setNome] = useState(currentUser.nome);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [skillsText, setSkillsText] = useState((currentUser.skills || []).join(", "));
  const [localizacao, setLocalizacao] = useState(currentUser.localizacao || "Luanda, Angola");
  const [contato, setContato] = useState(currentUser.contato || "");
  const [disponivel, setDisponivel] = useState(currentUser.disponivel);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    const skills = skillsText
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      const res = await fetch(`/api/usuarios/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          bio,
          skills,
          localizacao,
          contato,
          disponivel
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao atualizar.");
      }

      onProfileUpdate(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Houve um erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="profile-panel" className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-xl font-display font-medium text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" /> Meu Perfil do mEncontre
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mantenha seu portfólio atualizado para que os algoritmos de IA te selecionem em buscas locais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Disponibilidade de Match:</span>
          <button
            id="toggle-availability"
            onClick={() => setDisponivel(!disponivel)}
            className={`px-3 py-1 text-xs font-mono rounded-full border transition-all ${
              disponivel
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-slate-800 border-slate-700 text-slate-500"
            }`}
          >
            {disponivel ? "● DISPONÍVEL" : "○ OCUPADO"}
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" /> Perfil atualizado com sucesso no banco de dados! Seus matches agora usarão estas informações.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
              Nome Completo
            </label>
            <input
              id="prof-nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-indigo-500 outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
              Localização (Cidade, País)
            </label>
            <div className="relative">
              <input
                id="prof-loc"
                type="text"
                required
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-indigo-500 outline-none transition text-sm"
              />
              <MapPin className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
              Canal de Contato (GitHub / Twitter / LinkedIn)
            </label>
            <div className="relative">
              <input
                id="prof-contato"
                type="text"
                required
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="Ex: github.com/username"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-indigo-500 outline-none transition text-sm"
              />
              <Globe className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide flex items-center justify-between">
              <span>Habilidades Técnicas</span>
              <span className="text-[10px] text-slate-500 lowercase font-normal italic">mínimo 3 sugerido</span>
            </label>
            <input
              id="prof-skills"
              type="text"
              required
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-indigo-500 outline-none transition text-sm"
              placeholder="React, Solid, Docker, Golang"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
            Biografia Curta & Aspirações
          </label>
          <textarea
            id="prof-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-100 focus:border-indigo-500 outline-none transition text-sm resize-none"
            placeholder="Fale um pouco sobre qual time ideal de desenvolvimento você está buscando ou quais projetos quer criar."
          />
        </div>

        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Perfil atualizado instantaneamente!</span>
          </div>

          <button
            id="btn-save-profile"
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm py-2 px-5 rounded-lg transition shadow-lg shadow-indigo-600/15"
          >
            <Save className="w-4 h-4" />
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
