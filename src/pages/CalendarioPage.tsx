import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, MapPin, Clock, Trophy, Minus } from "lucide-react";
import escudo from "@/assets/escudo-circle.png";

interface CalendarioPageProps {
  onBack: () => void;
}

interface Match {
  id: string;
  home: string;
  homeInitials: string;
  away: string;
  awayInitials: string;
  date: string;
  time: string;
  location: string;
  homeScore?: number;
  awayScore?: number;
  status: "upcoming" | "played";
  round: string;
  isDebreHome: boolean;
}

const matches: Match[] = [
  { id: "1", home: "Debrê", homeInitials: "DF", away: "Vila Nova", awayInitials: "VN", date: "23 Fev", time: "19:27", location: "Campo do Debrê", status: "upcoming", round: "13ª Rodada", isDebreHome: true },
  { id: "2", home: "Atlético", homeInitials: "AC", away: "Debrê", awayInitials: "DF", date: "02 Mar", time: "15:00", location: "Estádio Municipal", status: "upcoming", round: "14ª Rodada", isDebreHome: false },
  { id: "3", home: "Debrê", homeInitials: "DF", away: "União Carmo", awayInitials: "UC", date: "09 Mar", time: "19:27", location: "Campo do Debrê", status: "upcoming", round: "15ª Rodada", isDebreHome: true },
  { id: "4", home: "Debrê", homeInitials: "DF", away: "Pedreira", awayInitials: "PE", date: "20 Fev", time: "19:27", location: "Campo do Debrê", homeScore: 4, awayScore: 0, status: "played", round: "12ª Rodada", isDebreHome: true },
  { id: "5", home: "São José", homeInitials: "SJ", away: "Debrê", awayInitials: "DF", date: "13 Fev", time: "15:00", location: "Campo São José", homeScore: 0, awayScore: 3, status: "played", round: "11ª Rodada", isDebreHome: false },
  { id: "6", home: "Debrê", homeInitials: "DF", away: "Vila Nova", awayInitials: "VN", date: "06 Fev", time: "19:27", location: "Campo do Debrê", homeScore: 2, awayScore: 1, status: "played", round: "10ª Rodada", isDebreHome: true },
  { id: "7", home: "União Carmo", homeInitials: "UC", away: "Debrê", awayInitials: "DF", date: "30 Jan", time: "15:00", location: "Campo União", homeScore: 1, awayScore: 4, status: "played", round: "9ª Rodada", isDebreHome: false },
];

const upcoming = matches.filter((m) => m.status === "upcoming");
const played = matches.filter((m) => m.status === "played");

function getResult(m: Match): "win" | "draw" | "loss" {
  if (m.homeScore === undefined || m.awayScore === undefined) return "draw";
  const debreScore = m.isDebreHome ? m.homeScore : m.awayScore;
  const oppScore = m.isDebreHome ? m.awayScore : m.homeScore;
  if (debreScore > oppScore) return "win";
  if (debreScore < oppScore) return "loss";
  return "draw";
}

const resultColors = {
  win: "bg-green-100 text-green-700 border-green-200",
  draw: "bg-yellow-50 text-yellow-700 border-yellow-200",
  loss: "bg-red-50 text-red-700 border-red-200",
};

const resultLabels = { win: "V", draw: "E", loss: "D" };

const CalendarioPage = ({ onBack }: CalendarioPageProps) => {
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
            <CalendarDays size={20} className="text-accent" />
            <h1 className="font-display text-lg text-foreground">CALENDÁRIO</h1>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="px-4 mt-4">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-wider mb-2">PRÓXIMOS JOGOS</h3>
        <div className="space-y-2">
          {upcoming.map((m, idx) => (
            <div key={m.id} className={`bg-card rounded-xl border overflow-hidden ${idx === 0 ? "border-accent/40 ring-1 ring-accent/20" : "border-border/50"}`}>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-accent">{m.round}</span>
                  {idx === 0 && <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">PRÓXIMO</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {m.isDebreHome ? (
                      <img src={escudo} alt="Debrê" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground">{m.homeInitials}</span>
                      </div>
                    )}
                    <span className="text-sm font-bold text-foreground">{m.home}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-bold px-2">VS</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-sm font-bold text-foreground">{m.away}</span>
                    {!m.isDebreHome ? (
                      <img src={escudo} alt="Debrê" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground">{m.awayInitials}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock size={10} />{m.date} · {m.time}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} />{m.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 mt-5">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-wider mb-2">RESULTADOS</h3>
        <div className="space-y-2">
          {played.map((m) => {
            const result = getResult(m);
            return (
              <div key={m.id} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">{m.round}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${resultColors[result]}`}>
                      {resultLabels[result]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      {m.isDebreHome ? (
                        <img src={escudo} alt="Debrê" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-[9px] font-bold text-muted-foreground">{m.homeInitials}</span>
                        </div>
                      )}
                      <span className="text-sm font-semibold text-foreground">{m.home}</span>
                    </div>
                    <div className="flex items-center gap-1 px-3">
                      <span className="text-lg font-bold text-foreground">{m.homeScore}</span>
                      <Minus size={10} className="text-muted-foreground" />
                      <span className="text-lg font-bold text-foreground">{m.awayScore}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-sm font-semibold text-foreground">{m.away}</span>
                      {!m.isDebreHome ? (
                        <img src={escudo} alt="Debrê" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-[9px] font-bold text-muted-foreground">{m.awayInitials}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-2 text-[10px] text-muted-foreground">
                    <span>{m.date} · {m.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarioPage;
