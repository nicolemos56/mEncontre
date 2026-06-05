/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  bio: string;
  skills: string[];
  localizacao: string;
  contato: string;
  disponivel: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderNome: string;
  texto: string;
  dataEnvio: string;
}

export interface MatchRecord {
  id: string;
  usuarioId: string; // The seeker who initiated matching
  usuarioAlvoId?: string; // Target local user ID if fonte is "interno"
  nomePerfil: string;
  contatoPerfil: string;
  skillsPerfil: string[];
  localizacaoPerfil: string;
  scoreIa: number;
  fonte: "interno" | "web";
  motivo: string;
  status: "pendente" | "aceito" | "rejeitado";
  dataCriacao: string;
  mensagens?: ChatMessage[];
}

export interface MatchBuscaRequest {
  prompt: string;
  incluirWeb: boolean;
}

export interface MatchBuscaResponse {
  matches: {
    nome: string;
    contato: string;
    skills: string[];
    localizacao: string;
    bio: string;
    score_ia: number; // 0 to 1
    fonte: "interno" | "web";
    motivo: string;
  }[];
}
