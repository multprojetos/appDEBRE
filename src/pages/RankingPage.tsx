import { motion } from "framer-motion";
import { ArrowLeft, Crown, Medal, Star, Flame, TrendingUp } from "lucide-react";

interface RankingPageProps {
  onBack: () => void;
}

interface Fan {
  pos: number;
  name: string;
  initials: string;
  points: number;
  level: string;
  streak: number;
  badge?: string;
}

const fans: Fan[] = [
  { pos: 1, name: "Marcos Torcedor", initials: "MT", points: 2450, level: "Fanático Lendário", streak: 12, badge: "🏆" },
  { pos: 2, name: "Ana Carolina", initials: "AC", points: 2180, level: "Fanático Ouro", streak: 9, badge: "🥇" },
  { pos: 3, name: "Pedro Fanático", initials: "PF", points: 1920, level: "Fanático Ouro", streak: 7, badge: "🥈" },
  { pos: 4, name: "Lucas Debrê", initials: "LD", points: 1650, level: "Fanático Prata", streak: 5 },
  { pos: 5, name: "Juliana FC", initials: "JF", points: 1480, level: "Fanático Prata", streak: 4 },
  { pos: 6, name: "Ricardo Silva", initials: "RS", points: 1200, level: "Torcedor Fiel", streak: 3 },
  { pos: 7, name: "Fernanda Costa", initials: "FC", points: 980, level: "Torcedor Fiel", streak: 2 },
  { pos: 8, name: "Bruno Almeida", initials: "BA", points: 750, level: "Torcedor", streak: 1 },
  { pos: 9, name: "Camila Rocha", initials: "CR", points: 620, level: "Torcedor", streak: 1 },
  { pos: 10, name: "Diego Martins", initials: "DM", points: 480, level: "Novato", streak: 0 },
];

const pointActions = [
  { action: "Votação do Craque", pts: "+50" },
  { action: "Publicar Resenha", pts: "+30" },
  { action: "Responder Enquete", pts: "+20" },
  { action: "Presença no jogo", pts: "+100" },
  { action: "Sequência diária", pts: "+10/dia" },
];

const RankingPage = ({ onBack }: RankingPageProps) => {
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
            <Crown size={20} className="text-accent" />
            <h1 className="font-display text-lg text-foreground">RANKING FANÁTICO</h1>
          </div>
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="px-4 mt-4">
        <div className="bg-primary rounded-xl p-4">
          <div className="flex items-end justify-center gap-3">
            {/* 2nd */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center border-2 border-primary-foreground/20">
                <span className="text-primary-foreground text-sm font-bold">{fans[1].initials}</span>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg px-3 py-2 mt-2 text-center min-w-[72px]">
                <p className="text-[10px] text-primary-foreground/60">2º</p>
                <p className="text-xs font-bold text-primary-foreground truncate">{fans[1].name.split(" ")[0]}</p>
                <p className="text-[10px] text-accent font-bold">{fans[1].points}pts</p>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center -mt-4">
              <Crown size={20} className="text-accent mb-1" />
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center border-2 border-accent">
                <span className="text-primary-foreground text-lg font-bold">{fans[0].initials}</span>
              </div>
              <div className="bg-accent/20 rounded-lg px-4 py-2 mt-2 text-center min-w-[80px]">
                <p className="text-[10px] text-accent">1º</p>
                <p className="text-sm font-bold text-primary-foreground truncate">{fans[0].name.split(" ")[0]}</p>
                <p className="text-xs text-accent font-bold">{fans[0].points}pts</p>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center border-2 border-primary-foreground/20">
                <span className="text-primary-foreground text-sm font-bold">{fans[2].initials}</span>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg px-3 py-2 mt-2 text-center min-w-[72px]">
                <p className="text-[10px] text-primary-foreground/60">3º</p>
                <p className="text-xs font-bold text-primary-foreground truncate">{fans[2].name.split(" ")[0]}</p>
                <p className="text-[10px] text-accent font-bold">{fans[2].points}pts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Your position */}
      <div className="mx-4 mt-3 px-4 py-3 bg-accent/10 border border-accent/20 rounded-xl flex items-center gap-3">
        <Medal size={18} className="text-accent" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Sua posição</p>
          <p className="text-sm font-bold text-foreground">15º lugar · 320 pontos</p>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp size={14} />
          <span className="text-xs font-bold">+3</span>
        </div>
      </div>

      {/* Full ranking */}
      <div className="px-4 mt-4">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-wider mb-2">TOP 10</h3>
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          {fans.map((fan, idx) => (
            <div
              key={fan.pos}
              className={`flex items-center gap-3 px-4 py-3 ${
                idx < fans.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              <span className={`text-sm font-bold w-6 text-center ${
                fan.pos <= 3 ? "text-accent" : "text-muted-foreground"
              }`}>
                {fan.badge || `${fan.pos}º`}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[10px] font-bold">{fan.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{fan.name}</p>
                <p className="text-[10px] text-muted-foreground">{fan.level}</p>
              </div>
              {fan.streak > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-bold">
                  <Flame size={10} />{fan.streak}
                </span>
              )}
              <span className="text-xs font-bold text-accent">{fan.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How to earn points */}
      <div className="px-4 mt-4">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-wider mb-2">COMO GANHAR PONTOS</h3>
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          {pointActions.map((item, idx) => (
            <div
              key={item.action}
              className={`flex items-center justify-between px-4 py-2.5 ${
                idx < pointActions.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              <span className="text-xs text-foreground">{item.action}</span>
              <span className="text-xs font-bold text-accent">{item.pts}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RankingPage;
