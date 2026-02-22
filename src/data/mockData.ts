export const nextMatch = {
  home: { name: "Debre", initials: "DF" },
  away: { name: "Vila Nova", initials: "VN" },
  date: "23 Fev",
  time: "19:27",
  location: "Campo do Debrê",
};

export const teamStats = {
  wins: 9,
  draws: 2,
  losses: 1,
  games: 12,
  goalsFor: 38,
  goalsAgainst: 12,
  points: 29,
  championship: "Campeonato Municipal 2026",
};

export const standings = [
  { pos: 1, name: "Debreceni FC", points: 29 },
  { pos: 2, name: "Vila Nova FC", points: 22 },
  { pos: 3, name: "Atlético Carmense", points: 19 },
  { pos: 4, name: "Pedreira FC", points: 14 },
  { pos: 5, name: "São José EC", points: 12 },
  { pos: 6, name: "União Carmo", points: 10 },
];

export type PlayerPosition = "GL" | "LD" | "LE" | "ZG" | "MC" | "MO" | "AT";

export interface Player {
  num: number;
  name: string;
  initials: string;
  pos: PlayerPosition;
  posLabel: string;
  goals: number;
  assists: number;
  games: number;
  category: "aberto" | "master";
}

export const squad: Player[] = [
  { num: 1, name: "Duda", initials: "DU", pos: "GL", posLabel: "Goleiro", goals: 0, assists: 0, games: 12, category: "aberto" },
  { num: 2, name: "Carlinhos", initials: "CA", pos: "LD", posLabel: "Lat. Dir.", goals: 0, assists: 3, games: 12, category: "aberto" },
  { num: 3, name: "Leandro", initials: "LE", pos: "LE", posLabel: "Lat. Esq.", goals: 1, assists: 2, games: 10, category: "aberto" },
  { num: 4, name: "Paulo Henrique", initials: "PH", pos: "ZG", posLabel: "Zagueiro", goals: 1, assists: 0, games: 11, category: "aberto" },
  { num: 5, name: "Renan", initials: "RE", pos: "ZG", posLabel: "Zagueiro", goals: 2, assists: 0, games: 10, category: "aberto" },
  { num: 6, name: "Thiago", initials: "TH", pos: "MC", posLabel: "Meia", goals: 3, assists: 5, games: 12, category: "aberto" },
  { num: 7, name: "Marquinhos", initials: "MA", pos: "AT", posLabel: "Atacante", goals: 8, assists: 2, games: 11, category: "aberto" },
  { num: 8, name: "Dudu", initials: "DD", pos: "MO", posLabel: "Meia Of.", goals: 5, assists: 7, games: 12, category: "aberto" },
  { num: 9, name: "Rodrigo", initials: "RO", pos: "AT", posLabel: "Atacante", goals: 10, assists: 1, games: 12, category: "aberto" },
  { num: 10, name: "Bruno Silva", initials: "BS", pos: "MC", posLabel: "Meia", goals: 4, assists: 4, games: 11, category: "aberto" },
  { num: 11, name: "Felipe", initials: "FE", pos: "AT", posLabel: "Atacante", goals: 4, assists: 3, games: 10, category: "aberto" },
  { num: 12, name: "Marcos", initials: "MC", pos: "GL", posLabel: "Goleiro", goals: 0, assists: 0, games: 8, category: "master" },
  { num: 13, name: "André", initials: "AN", pos: "ZG", posLabel: "Zagueiro", goals: 1, assists: 0, games: 9, category: "master" },
  { num: 14, name: "Serginho", initials: "SE", pos: "MC", posLabel: "Meia", goals: 3, assists: 2, games: 10, category: "master" },
  { num: 15, name: "Cláudio", initials: "CL", pos: "AT", posLabel: "Atacante", goals: 6, assists: 1, games: 10, category: "master" },
  { num: 16, name: "Wellington", initials: "WE", pos: "LD", posLabel: "Lat. Dir.", goals: 0, assists: 4, games: 9, category: "master" },
];

export type NewsCategory = "NOTÍCIAS" | "ELENCO" | "MANTO" | "RESULTADOS";

export interface NewsItem {
  id: number;
  category: NewsCategory;
  hot: boolean;
  title: string;
  preview: string;
  time: string;
  imageUrl?: string;
}

export const news: NewsItem[] = [
  {
    id: 1,
    category: "NOTÍCIAS",
    hot: true,
    title: "Debrê goleia por 4 a 1 e assume liderança do campeonato municipal",
    preview: "Com dois gols de Marquinhos e atuação impecável do goleiro Duda, o Debreceni FC venceu mais uma e disparou na tabela.",
    time: "1d atrás",
  },
  {
    id: 2,
    category: "ELENCO",
    hot: false,
    title: "Convocados para a próxima rodada – categoria Aberto e Master",
    preview: "Confira a lista completa dos jogadores confirmados para o jogo de domingo contra o Vila Nova FC.",
    time: "1d atrás",
  },
  {
    id: 3,
    category: "MANTO",
    hot: false,
    title: "Novo manto é revelado! Vem ver o uniforme novo, mermão!",
    preview: "O novo uniforme chega com traços do escudo histórico do clube e detalhes em dourado que remetem à tradição.",
    time: "1d atrás",
  },
  {
    id: 4,
    category: "RESULTADOS",
    hot: false,
    title: "Rodada passada: Debrê 4 x 0 Pedreira",
    preview: "Vitória tranquila no Campo do Debrê com gols de Rodrigo (2), Marquinhos e Dudu.",
    time: "2d atrás",
  },
  {
    id: 5,
    category: "NOTÍCIAS",
    hot: true,
    title: "Campeonato Municipal 2026: tabela atualizada após a 12ª rodada",
    preview: "Debreceni FC lidera com 29 pontos, 7 de vantagem para o segundo colocado Vila Nova.",
    time: "3d atrás",
  },
];

export const positionColors: Record<string, { bg: string; text: string }> = {
  GL: { bg: "bg-red-100", text: "text-red-700" },
  LD: { bg: "bg-emerald-100", text: "text-emerald-700" },
  LE: { bg: "bg-emerald-100", text: "text-emerald-700" },
  ZG: { bg: "bg-blue-100", text: "text-blue-700" },
  MC: { bg: "bg-purple-100", text: "text-purple-700" },
  MO: { bg: "bg-purple-100", text: "text-purple-700" },
  AT: { bg: "bg-orange-100", text: "text-orange-700" },
};

export const categoryColors: Record<NewsCategory, string> = {
  "NOTÍCIAS": "bg-navy text-primary-foreground",
  "ELENCO": "bg-success text-white",
  "MANTO": "bg-gold text-white",
  "RESULTADOS": "bg-blue-500 text-white",
};
