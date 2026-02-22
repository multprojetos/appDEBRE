import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Check, Clock, Users } from "lucide-react";

interface EnquetesPageProps {
  onBack: () => void;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  endsIn: string;
  totalVotes: number;
  active: boolean;
}

const mockPolls: Poll[] = [
  {
    id: "1",
    question: "Qual deve ser o próximo reforço do Debrê?",
    options: [
      { id: "1a", text: "Mais um atacante", votes: 45 },
      { id: "1b", text: "Um meia criativo", votes: 62 },
      { id: "1c", text: "Zagueiro experiente", votes: 28 },
      { id: "1d", text: "Lateral esquerdo", votes: 15 },
    ],
    endsIn: "12h",
    totalVotes: 150,
    active: true,
  },
  {
    id: "2",
    question: "Melhor jogo do Debrê na temporada?",
    options: [
      { id: "2a", text: "Debrê 4x1 Pedreira", votes: 89 },
      { id: "2b", text: "Debrê 3x0 São José", votes: 54 },
      { id: "2c", text: "Debrê 2x1 Vila Nova", votes: 72 },
    ],
    endsIn: "6h",
    totalVotes: 215,
    active: true,
  },
  {
    id: "3",
    question: "Cor do terceiro uniforme 2026?",
    options: [
      { id: "3a", text: "Branco com detalhes dourados", votes: 120 },
      { id: "3b", text: "Preto total", votes: 98 },
      { id: "3c", text: "Cinza com azul marinho", votes: 67 },
    ],
    endsIn: "Encerrada",
    totalVotes: 285,
    active: false,
  },
];

const EnquetesPage = ({ onBack }: EnquetesPageProps) => {
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});

  const handleVote = (pollId: string, optionId: string) => {
    if (votedPolls[pollId]) return;
    setVotedPolls((prev) => ({ ...prev, [pollId]: optionId }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
      className="min-h-screen pb-20 bg-background"
    >
      <div className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="p-1 -ml-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-accent" />
            <h1 className="font-display text-lg text-foreground">ENQUETES</h1>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {mockPolls.map((poll) => {
          const userVote = votedPolls[poll.id];
          const showResults = !!userVote || !poll.active;
          const adjustedTotal = poll.totalVotes + (userVote ? 1 : 0);

          return (
            <div key={poll.id} className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    poll.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {poll.active ? "ATIVA" : "ENCERRADA"}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock size={10} /> {poll.endsIn}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{poll.question}</h3>
              </div>

              <div className="px-4 pb-3 space-y-2">
                {poll.options.map((opt) => {
                  const optVotes = opt.votes + (userVote === opt.id ? 1 : 0);
                  const pct = adjustedTotal > 0 ? Math.round((optVotes / adjustedTotal) * 100) : 0;
                  const isSelected = userVote === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleVote(poll.id, opt.id)}
                      disabled={showResults}
                      className={`w-full rounded-lg border overflow-hidden relative transition-all ${
                        isSelected ? "border-accent ring-1 ring-accent/30" : "border-border/50"
                      }`}
                    >
                      {showResults && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5 }}
                          className={`absolute inset-y-0 left-0 ${isSelected ? "bg-accent/15" : "bg-muted/50"}`}
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-between px-3 py-2.5">
                        <span className="text-sm text-foreground">{opt.text}</span>
                        <div className="flex items-center gap-1">
                          {showResults && (
                            <span className={`text-xs font-bold ${isSelected ? "text-accent" : "text-muted-foreground"}`}>
                              {pct}%
                            </span>
                          )}
                          {isSelected && <Check size={14} className="text-accent" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-4 pb-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Users size={10} />
                <span>{adjustedTotal} votos</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default EnquetesPage;
