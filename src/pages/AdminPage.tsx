import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Plus, Pencil, Trash2, X, Newspaper, Users, Calendar, BarChart3 } from "lucide-react";
import { news as mockNews, squad as mockSquad, type NewsItem, type Player, type NewsCategory } from "@/data/mockData";

interface AdminPageProps {
  onBack: () => void;
}

type AdminTab = "noticias" | "elenco" | "jogos" | "enquetes";

const tabs: { id: AdminTab; label: string; icon: typeof Newspaper }[] = [
  { id: "noticias", label: "Notícias", icon: Newspaper },
  { id: "elenco", label: "Elenco", icon: Users },
  { id: "jogos", label: "Jogos", icon: Calendar },
  { id: "enquetes", label: "Enquetes", icon: BarChart3 },
];

// Mock jogos
const mockJogos = [
  { id: 1, home: "Debreceni FC", away: "Vila Nova FC", date: "23/02/2026", time: "19:27", score: null, location: "Campo do Debrê" },
  { id: 2, home: "Pedreira FC", away: "Debreceni FC", date: "02/03/2026", time: "15:00", score: null, location: "Campo do Pedreira" },
  { id: 3, home: "Debreceni FC", away: "Pedreira FC", date: "16/02/2026", time: "16:00", score: "4 x 0", location: "Campo do Debrê" },
  { id: 4, home: "Atlético Carmense", away: "Debreceni FC", date: "09/02/2026", time: "10:00", score: "1 x 4", location: "Campo Municipal" },
];

// Mock enquetes
const mockEnquetes = [
  { id: 1, question: "Qual uniforme usar no próximo jogo?", options: ["Branco", "Azul Marinho", "Dourado"], votes: [45, 32, 23], active: true },
  { id: 2, question: "Melhor jogador do mês?", options: ["Rodrigo", "Marquinhos", "Dudu"], votes: [38, 35, 27], active: false },
  { id: 3, question: "Local do churrasco de confraternização?", options: ["Campo do Debrê", "Sítio do Renan", "Praça da Igreja"], votes: [20, 55, 25], active: true },
];

const AdminPage = ({ onBack }: AdminPageProps) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("noticias");
  const [search, setSearch] = useState("");
  const [newsItems, setNewsItems] = useState(mockNews);
  const [players, setPlayers] = useState(mockSquad);
  const [jogos, setJogos] = useState(mockJogos);
  const [enquetes, setEnquetes] = useState(mockEnquetes);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsForm, setNewsForm] = useState({ title: "", preview: "", category: "NOTÍCIAS" as NewsCategory, hot: false });

  const openNewNews = () => {
    setEditingNews(null);
    setNewsForm({ title: "", preview: "", category: "NOTÍCIAS", hot: false });
    setModalOpen(true);
  };

  const openEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setNewsForm({ title: item.title, preview: item.preview, category: item.category, hot: item.hot });
    setModalOpen(true);
  };

  const saveNews = () => {
    if (editingNews) {
      setNewsItems((prev) => prev.map((n) => (n.id === editingNews.id ? { ...n, ...newsForm } : n)));
    } else {
      setNewsItems((prev) => [{ id: Date.now(), time: "Agora", ...newsForm }, ...prev]);
    }
    setModalOpen(false);
  };

  const deleteNews = (id: number) => setNewsItems((prev) => prev.filter((n) => n.id !== id));
  const deletePlayer = (num: number) => setPlayers((prev) => prev.filter((p) => p.num !== num));
  const deleteJogo = (id: number) => setJogos((prev) => prev.filter((j) => j.id !== id));
  const deleteEnquete = (id: number) => setEnquetes((prev) => prev.filter((e) => e.id !== id));
  const toggleEnquete = (id: number) => setEnquetes((prev) => prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e)));

  const filterBySearch = (text: string) => text.toLowerCase().includes(search.toLowerCase());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-4 safe-top flex items-center gap-3">
        <button onClick={onBack} className="p-1"><ArrowLeft size={22} className="text-foreground" /></button>
        <h1 className="font-display text-2xl text-foreground tracking-wide">PAINEL ADMIN</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-3 overflow-x-auto">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(""); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-gold text-white" : "bg-card text-foreground border border-border"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Add */}
      <div className="px-4 mt-3 flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold"
          />
        </div>
        {activeTab === "noticias" && (
          <button onClick={openNewNews} className="flex items-center gap-1 px-4 py-2 bg-gold text-white rounded-xl text-xs font-bold">
            <Plus size={14} /> Nova
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        <AnimatePresence mode="wait">
          {activeTab === "noticias" && (
            <motion.div key="noticias" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
              {newsItems.filter((n) => filterBySearch(n.title)).map((item) => (
                <div key={item.id} className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.category} · {item.time}</p>
                  </div>
                  <button onClick={() => openEditNews(item)} className="p-2 hover:bg-muted rounded-lg"><Pencil size={14} className="text-gold" /></button>
                  <button onClick={() => deleteNews(item.id)} className="p-2 hover:bg-muted rounded-lg"><Trash2 size={14} className="text-destructive" /></button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "elenco" && (
            <motion.div key="elenco" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
              {players.filter((p) => filterBySearch(p.name)).map((p) => (
                <div key={p.num} className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center">
                    <span className="text-gold font-bold text-sm">{p.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">#{p.num} {p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.posLabel} · {p.category}</p>
                  </div>
                  <button className="p-2 hover:bg-muted rounded-lg"><Pencil size={14} className="text-gold" /></button>
                  <button onClick={() => deletePlayer(p.num)} className="p-2 hover:bg-muted rounded-lg"><Trash2 size={14} className="text-destructive" /></button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "jogos" && (
            <motion.div key="jogos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
              {jogos.filter((j) => filterBySearch(`${j.home} ${j.away}`)).map((j) => (
                <div key={j.id} className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{j.home} x {j.away}</p>
                    <p className="text-xs text-muted-foreground">{j.date} · {j.time} · {j.location}</p>
                    {j.score && <p className="text-xs font-bold text-gold mt-0.5">Placar: {j.score}</p>}
                  </div>
                  <button className="p-2 hover:bg-muted rounded-lg"><Pencil size={14} className="text-gold" /></button>
                  <button onClick={() => deleteJogo(j.id)} className="p-2 hover:bg-muted rounded-lg"><Trash2 size={14} className="text-destructive" /></button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "enquetes" && (
            <motion.div key="enquetes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
              {enquetes.filter((e) => filterBySearch(e.question)).map((e) => (
                <div key={e.id} className="bg-card rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{e.question}</p>
                      <p className="text-xs text-muted-foreground">{e.options.length} opções · {e.votes.reduce((a, b) => a + b, 0)} votos</p>
                    </div>
                    <button
                      onClick={() => toggleEnquete(e.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${e.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
                    >
                      {e.active ? "ATIVA" : "ENCERRADA"}
                    </button>
                    <button onClick={() => deleteEnquete(e.id)} className="p-2 hover:bg-muted rounded-lg"><Trash2 size={14} className="text-destructive" /></button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Notícia */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[430px] bg-card rounded-t-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-foreground">{editingNews ? "EDITAR NOTÍCIA" : "NOVA NOTÍCIA"}</h2>
                <button onClick={() => setModalOpen(false)}><X size={20} className="text-muted-foreground" /></button>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  placeholder="Título"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-gold"
                />
                <textarea
                  placeholder="Texto de preview"
                  value={newsForm.preview}
                  onChange={(e) => setNewsForm((f) => ({ ...f, preview: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm resize-none focus:outline-none focus:border-gold"
                />
                <select
                  value={newsForm.category}
                  onChange={(e) => setNewsForm((f) => ({ ...f, category: e.target.value as NewsCategory }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-gold"
                >
                  <option value="NOTÍCIAS">Notícias</option>
                  <option value="RESULTADOS">Resultados</option>
                  <option value="ELENCO">Elenco</option>
                  <option value="MANTO">Manto</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={newsForm.hot} onChange={(e) => setNewsForm((f) => ({ ...f, hot: e.target.checked }))} className="rounded" />
                  Marcar como 🔥 HOT
                </label>
                <button onClick={saveNews} className="w-full py-3 bg-gold text-white font-bold rounded-xl mt-1">
                  {editingNews ? "Salvar Alterações" : "Publicar Notícia"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminPage;
