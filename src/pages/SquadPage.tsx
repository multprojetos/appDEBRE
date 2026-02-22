import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { squad, positionColors, type Player } from "@/data/mockData";

const avatarColors = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-purple-600",
  "bg-orange-600",
  "bg-rose-600",
  "bg-teal-600",
  "bg-indigo-600",
  "bg-amber-600",
];

const SquadPage = () => {
  const [category, setCategory] = useState<"aberto" | "master">("aberto");
  const [search, setSearch] = useState("");

  const filtered = squad.filter(
    (p) =>
      p.category === category &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="min-h-screen pb-20"
    >
      <div className="px-4 pt-4 safe-top">
        <h1 className="font-display text-2xl text-foreground tracking-wide">
          ELENCO 2026
        </h1>
      </div>

      {/* Category toggle */}
      <div className="px-4 mt-3 flex gap-2">
        {(["aberto", "master"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              category === cat
                ? "bg-gold text-white"
                : "bg-card text-foreground border border-border"
            }`}
          >
            {cat === "aberto" ? "⚽ ABERTO" : "🏅 MASTER"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar jogador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
          />
        </div>
      </div>

      <div className="px-4 mt-2">
        <p className="text-xs text-muted-foreground">
          {filtered.length} jogadores · Categoria {category === "aberto" ? "Aberto" : "Master"}
        </p>
      </div>

      {/* Grid */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        {filtered.map((player, idx) => {
          const posColor = positionColors[player.pos];
          return (
            <motion.div
              key={player.num}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-card rounded-xl p-4 shadow-sm border border-border/50 relative"
            >
              {/* Number badge */}
              <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gold-light/20 text-gold text-xs font-bold flex items-center justify-center">
                {player.num}
              </span>

              {/* Avatar */}
              <div
                className={`w-14 h-14 rounded-full ${
                  avatarColors[idx % avatarColors.length]
                } flex items-center justify-center mx-auto mb-2`}
              >
                <span className="text-white font-bold text-lg">{player.initials}</span>
              </div>

              <h3 className="text-sm font-bold text-foreground text-center truncate">
                {player.name}
              </h3>

              {/* Position badge */}
              <div className="flex justify-center mt-1.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${posColor.bg} ${posColor.text}`}
                >
                  {player.posLabel}
                </span>
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-4 mt-3">
                <div className="text-center">
                  <span className="block text-lg font-bold text-gold">
                    {player.goals}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    GOLS
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-bold text-gold">
                    {player.games}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    JOGOS
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SquadPage;
