import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Shield } from "lucide-react";
import { news, categoryColors, type NewsCategory } from "@/data/mockData";

const filters: ("TODAS" | NewsCategory)[] = [
  "TODAS",
  "NOTÍCIAS",
  "RESULTADOS",
  "ELENCO",
  "MANTO",
];

interface NewsPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

const NewsPage = ({ onNavigate }: NewsPageProps) => {
  const [activeFilter, setActiveFilter] = useState<"TODAS" | NewsCategory>("TODAS");
  const [search, setSearch] = useState("");

  const filtered = news.filter((item) => {
    const matchesFilter = activeFilter === "TODAS" || item.category === activeFilter;
    const matchesSearch =
      search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="min-h-screen pb-20"
    >
      {/* Header */}
      <div className="px-4 pt-4 safe-top">
        <h1 className="font-display text-2xl text-foreground tracking-wide">
          FIQUE POR DENTRO
        </h1>
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar notícias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mt-3 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeFilter === f
                  ? "bg-gold text-white"
                  : "bg-navy text-primary-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* News list */}
      <div className="px-4 mt-4 flex flex-col">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onClick={() => onNavigate?.("news-detail", { newsId: item.id, from: "news" })}
              className="flex gap-3 items-start py-3 border-b border-border/60 last:border-0 text-left w-full hover:bg-muted/30 transition-colors rounded-lg px-1"
            >
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Shield size={22} className="text-muted-foreground/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      categoryColors[item.category]
                    }`}
                  >
                    {item.category}
                  </span>
                  {item.hot && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                      🔥 HOT
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {item.preview}
                </p>
                <span className="text-[11px] text-muted-foreground/70 mt-1 block">
                  {item.time}
                </span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground mt-2 flex-shrink-0" />
            </motion.button>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">Nenhuma notícia encontrada</p>
            <p className="text-xs mt-1">Tente outro filtro ou termo de busca</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NewsPage;
