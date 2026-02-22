import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Vote,
  Shirt,
  Star,
  Flame,
  ChevronRight,
} from "lucide-react";
import escudo from "@/assets/escudo-circle.png";
import { nextMatch, news, categoryColors } from "@/data/mockData";
import AppHeader from "@/components/AppHeader";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

interface HomePageProps {
  onNavigate?: (page: string, data?: any) => void;
}

const HomePage = ({ onNavigate }: HomePageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="min-h-screen pb-20"
    >
      <AppHeader />

      {/* Próxima Partida */}
      <div className="px-4 mt-2">
        <motion.div
          {...fadeIn}
          className="bg-navy rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-gold/20 rounded-full" />
          </div>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 text-[10px] font-semibold tracking-widest border border-gold/50 text-gold rounded-full mb-4">
              PRÓXIMA PARTIDA
            </span>

            <div className="flex items-center justify-between">
              {/* Home */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-navy-light flex items-center justify-center border-2 border-gold/30 overflow-hidden">
                  <img src={escudo} alt="Debreceni FC" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-semibold text-primary-foreground">
                  {nextMatch.home.name}
                </span>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center">
                <span className="font-display text-3xl text-gold">VS</span>
              </div>

              {/* Away */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-navy-light flex items-center justify-center border-2 border-primary-foreground/20">
                  <span className="font-display text-xl text-primary-foreground/70">
                    {nextMatch.away.initials}
                  </span>
                </div>
                <span className="text-sm font-semibold text-primary-foreground">
                  {nextMatch.away.name}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 text-primary-foreground/70 text-xs">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} />
                {nextMatch.date} · {nextMatch.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {nextMatch.location}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Acesso Rápido */}
      <div className="px-4 mt-6">
        <h2 className="font-display text-xl text-foreground tracking-wide mb-3">
          ACESSO RÁPIDO
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Vote, label: "Voto do Torcedor", color: "text-destructive", page: "votacao" },
            { icon: Shirt, label: "Manto Sagrado", color: "text-accent", page: "manto" },
            { icon: CalendarDays, label: "Calendário", color: "text-green-600", page: "calendario" },
            { icon: Flame, label: "Resenha do Debre", color: "text-orange-500", page: "resenha" },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.97 }}
              onClick={() => (item as any).page && onNavigate?.((item as any).page)}
              className="bg-card rounded-xl p-4 flex flex-col items-start gap-2 shadow-sm border border-border/50 hover:shadow-md transition-shadow"
            >
              <item.icon size={22} className={item.color} />
              <span className="text-sm font-semibold text-foreground">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Últimas do Debre */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-foreground tracking-wide">
            ÚLTIMAS DO DEBRE
          </h2>
          <button className="text-sm font-semibold text-gold">Ver todas</button>
        </div>

        <div className="flex flex-col gap-3">
          {news.slice(0, 3).map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate?.("news-detail", { newsId: item.id, from: "home" })}
              className="bg-card rounded-xl p-3 flex gap-3 items-start shadow-sm border border-border/50 text-left w-full hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src={escudo} alt="Debreceni FC" className="w-12 h-12 object-cover rounded-full" />
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
                      🔥
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                  {item.title}
                </h3>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  {item.time}
                </span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground mt-1 flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;
