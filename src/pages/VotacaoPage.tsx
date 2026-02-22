import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Check, Star } from "lucide-react";
import escudo from "@/assets/escudo-circle.png";
import { squad } from "@/data/mockData";

interface VotacaoPageProps {
  onBack: () => void;
}

const matchInfo = {
  title: "Debrê 4 x 1 Pedreira FC",
  date: "Rodada 12 · 20 Fev 2026",
  totalVotes: 187,
};

const candidates = squad
  .filter((p) => p.category === "aberto")
  .sort((a, b) => b.goals + b.assists - (a.goals + a.assists))
  .slice(0, 6);

const VotacaoPage = ({ onBack }: VotacaoPageProps) => {
  const [voted, setVoted] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<number, number>>({
    9: 62, 7: 48, 8: 35, 6: 22, 10: 12, 11: 8,
  });

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0) + (voted !== null ? 1 : 0);

  const handleVote = (num: number) => {
    if (voted !== null) return;
    setVoted(num);
    setVotes((prev) => ({ ...prev, [num]: (prev[num] || 0) + 1 }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
      className="min-h-screen pb-20 bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="p-1 -ml-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-accent" />
            <h1 className="font-display text-lg text-foreground">VOTAÇÃO FANÁTICO</h1>
          </div>
        </div>
      </div>

      {/* Match card */}
      <div className="px-4 mt-4">
        <div className="bg-primary rounded-xl p-4 text-center">
          <p className="text-[10px] tracking-widest text-accent font-bold mb-1">CRAQUE DA PARTIDA</p>
          <h2 className="font-display text-xl text-primary-foreground">{matchInfo.title}</h2>
          <p className="text-xs text-primary-foreground/60 mt-1">{matchInfo.date}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star size={12} className="text-accent" />
            <span className="text-xs text-accent font-bold">{totalVotes} votos</span>
          </div>
        </div>
      </div>

      {voted !== null && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
          <Check size={14} className="text-green-600" />
          <p className="text-xs text-green-700 font-semibold">Voto computado! Obrigado, torcedor.</p>
        </div>
      )}

      {/* Candidates */}
      <div className="px-4 mt-4 space-y-2">
        {candidates.map((player) => {
          const playerVotes = votes[player.num] || 0;
          const pct = totalVotes > 0 ? Math.round((playerVotes / totalVotes) * 100) : 0;
          const isSelected = voted === player.num;

          return (
            <motion.button
              key={player.num}
              whileTap={voted === null ? { scale: 0.98 } : {}}
              onClick={() => handleVote(player.num)}
              disabled={voted !== null}
              className={`w-full bg-card rounded-xl border overflow-hidden transition-all ${
                isSelected ? "border-accent ring-2 ring-accent/30" : "border-border/50"
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3 relative">
                {/* Progress bar background */}
                {voted !== null && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`absolute inset-y-0 left-0 ${isSelected ? "bg-accent/15" : "bg-muted/40"}`}
                  />
                )}

                <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground text-xs font-bold">{player.initials}</span>
                </div>

                <div className="flex-1 text-left relative z-10 min-w-0">
                  <p className="text-sm font-bold text-foreground">{player.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    #{player.num} · {player.posLabel} · {player.goals}G {player.assists}A
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-2">
                  {voted !== null && (
                    <span className={`text-sm font-bold ${isSelected ? "text-accent" : "text-muted-foreground"}`}>
                      {pct}%
                    </span>
                  )}
                  {isSelected && <Check size={18} className="text-accent" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-[10px] text-muted-foreground mt-4 px-4">
        Votação encerra 48h após a partida · 1 voto por torcedor
      </p>
    </motion.div>
  );
};

export default VotacaoPage;
