import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Swords,
  Handshake,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
} from "lucide-react";
import { teamStats, standings, squad } from "@/data/mockData";

type SubTab = "time" | "artilharia" | "assistencias";

const StatsPage = () => {
  const [category, setCategory] = useState<"aberto" | "master">("aberto");
  const [subTab, setSubTab] = useState<SubTab>("time");

  const total = teamStats.wins + teamStats.draws + teamStats.losses;
  const winPct = Math.round((teamStats.wins / total) * 100);
  const drawPct = Math.round((teamStats.draws / total) * 100);
  const lossPct = 100 - winPct - drawPct;
  const aproveitamento = Math.round(
    (teamStats.points / (teamStats.games * 3)) * 100
  );

  const playersForCategory = squad.filter((p) => p.category === category);
  const topScorers = [...playersForCategory]
    .sort((a, b) => b.goals - a.goals)
    .filter((p) => p.goals > 0);
  const topAssists = [...playersForCategory]
    .sort((a, b) => b.assists - a.assists)
    .filter((p) => p.assists > 0);
  const maxGoals = topScorers[0]?.goals || 1;
  const maxAssists = topAssists[0]?.assists || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="min-h-screen pb-20"
    >
      <div className="px-4 pt-4 safe-top flex items-center gap-2">
        <BarChart3 size={22} className="text-gold" />
        <h1 className="font-display text-2xl text-foreground tracking-wide">
          DEBRE-STATS CARMENSE
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

      {/* Sub tabs */}
      <div className="px-4 mt-3 flex gap-1 bg-card rounded-xl p-1 border border-border">
        {([
          { id: "time" as SubTab, label: "TIME" },
          { id: "artilharia" as SubTab, label: "ARTILHARIA" },
          { id: "assistencias" as SubTab, label: "ASSISTÊNCIAS" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
              subTab === tab.id
                ? "bg-navy text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4">
        {subTab === "time" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Championship card */}
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
              <p className="text-[10px] font-bold text-gold tracking-wider mb-3">
                {teamStats.championship.toUpperCase()} · {category.toUpperCase()}
              </p>
              <div className="flex justify-between mb-3">
                <div className="text-center">
                  <span className="text-2xl font-bold text-success">{teamStats.wins}</span>
                  <p className="text-[10px] text-muted-foreground font-semibold">VITÓRIAS</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-gold">{teamStats.draws}</span>
                  <p className="text-[10px] text-muted-foreground font-semibold">EMPATES</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-destructive">{teamStats.losses}</span>
                  <p className="text-[10px] text-muted-foreground font-semibold">DERROTAS</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 rounded-full overflow-hidden flex bg-muted">
                <div className="bg-success h-full" style={{ width: `${winPct}%` }} />
                <div className="bg-gold h-full" style={{ width: `${drawPct}%` }} />
                <div className="bg-destructive h-full" style={{ width: `${lossPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {aproveitamento}% aproveitamento
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Target, label: "JOGOS", value: teamStats.games },
                { icon: Trophy, label: "VITÓRIAS", value: teamStats.wins },
                { icon: Handshake, label: "EMPATES", value: teamStats.draws },
                { icon: XCircle, label: "DERROTAS", value: teamStats.losses },
                { icon: TrendingUp, label: "GOLS PRÓ", value: teamStats.goalsFor },
                { icon: TrendingDown, label: "GOLS CONTRA", value: teamStats.goalsAgainst },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card rounded-xl p-3 border border-border/50 text-center"
                >
                  <stat.icon size={16} className="text-gold mx-auto mb-1" />
                  <span className="block text-xl font-bold text-gold">
                    {stat.value}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Standings */}
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-gold rounded-full" />
                <h3 className="font-display text-lg text-foreground">CLASSIFICAÇÃO</h3>
              </div>
              <div className="space-y-0">
                {standings.map((team, idx) => (
                  <div
                    key={team.pos}
                    className={`flex items-center justify-between py-2.5 px-2 rounded-lg ${
                      idx % 2 === 0 ? "bg-muted/40" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                          team.pos === 1
                            ? "bg-gold text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {team.pos}
                      </span>
                      <span
                        className={`text-sm ${
                          team.name === "Debreceni FC"
                            ? "font-bold text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {team.name}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        team.name === "Debreceni FC"
                          ? "text-gold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {team.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {subTab === "artilharia" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {topScorers.map((player, idx) => (
              <div
                key={player.num}
                className="bg-card rounded-xl p-3 flex items-center gap-3 border border-border/50"
              >
                <span className="w-6 text-sm font-bold text-muted-foreground text-center">
                  {idx + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold text-sm">{player.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {player.name}
                  </p>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full"
                      style={{ width: `${(player.goals / maxGoals) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xl font-bold text-gold">{player.goals}</span>
              </div>
            ))}
            {topScorers.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">Sem dados de artilharia</p>
            )}
          </motion.div>
        )}

        {subTab === "assistencias" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {topAssists.map((player, idx) => (
              <div
                key={player.num}
                className="bg-card rounded-xl p-3 flex items-center gap-3 border border-border/50"
              >
                <span className="w-6 text-sm font-bold text-muted-foreground text-center">
                  {idx + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-bold text-sm">{player.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {player.name}
                  </p>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full"
                      style={{ width: `${(player.assists / maxAssists) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xl font-bold text-gold">{player.assists}</span>
              </div>
            ))}
            {topAssists.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">Sem dados de assistências</p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsPage;
