import { motion } from "framer-motion";
import { ArrowLeft, Clock, Share2, ChevronRight } from "lucide-react";
import { news, categoryColors, type NewsItem } from "@/data/mockData";
import escudo from "@/assets/escudo-circle.png";

interface NewsDetailPageProps {
  newsId: number;
  onBack: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

const fullContent: Record<number, string> = {
  1: `O Debreceni FC fez mais uma grande exibição e goleou por 4 a 1 no Campo do Debrê, assumindo a liderança isolada do Campeonato Municipal 2026.\n\nMarquinhos abriu o placar logo aos 12 minutos do primeiro tempo com um chute de fora da área. O segundo gol veio dos pés de Rodrigo, que aproveitou cruzamento preciso de Dudu.\n\nNo segundo tempo, Marquinhos marcou novamente, desta vez de cabeça, e Dudu fechou o placar com um golaço de falta. O adversário descontou nos acréscimos.\n\nCom este resultado, o Debrê chega a 29 pontos, 7 a mais que o vice-líder Vila Nova FC. A equipe segue invicta há 8 jogos e é a melhor defesa do campeonato com apenas 12 gols sofridos.`,
  2: `O técnico divulgou a lista de convocados para o confronto da próxima rodada contra o Vila Nova FC.\n\nNa categoria Aberto, todos os 11 jogadores titulares foram confirmados, com destaque para o retorno de Felipe, que se recuperou de lesão muscular.\n\nNa categoria Master, Cláudio e Serginho lideram o grupo de 5 jogadores convocados. Wellington também está confirmado após cumprir suspensão.\n\nA concentração será no próprio Campo do Debrê, com preleção marcada para as 18h do dia do jogo.`,
  3: `O Debreceni FC revelou oficialmente seu novo uniforme para a temporada 2026.\n\nO manto traz como principal novidade os detalhes em dourado no escudo bordado, inspirados na tradição do clube fundado em 2009. A gola V em azul marinho complementa o design clássico.\n\nO uniforme já está disponível para encomenda através dos canais oficiais do clube. Os valores são: camisa principal R$ 89,90 e camisa reserva R$ 79,90.\n\nOs torcedores que comprarem até o dia do próximo jogo receberão uma estampa personalizada com nome e número gratuitamente.`,
  4: `Vitória tranquila do Debreceni FC sobre o Pedreira FC por 4 a 0 no Campo do Debrê.\n\nRodrigo foi o destaque com dois gols, um no primeiro e outro no segundo tempo. Marquinhos e Dudu completaram o placar.\n\nO Debrê dominou o jogo do início ao fim, com 72% de posse de bola e 15 finalizações, sendo 8 no gol.`,
  5: `Após 12 rodadas do Campeonato Municipal 2026, o Debreceni FC lidera com folga.\n\nClassificação atualizada:\n1º Debreceni FC - 29 pts\n2º Vila Nova FC - 22 pts\n3º Atlético Carmense - 19 pts\n4º Pedreira FC - 14 pts\n5º São José EC - 12 pts\n6º União Carmo - 10 pts\n\nA próxima rodada traz o confronto direto entre Debreceni e Vila Nova, no Campo do Debrê.`,
};

const NewsDetailPage = ({ newsId, onBack, onNavigate }: NewsDetailPageProps) => {
  const item = news.find((n) => n.id === newsId);
  if (!item) return null;

  const related = news.filter((n) => n.id !== newsId).slice(0, 3);
  const content = fullContent[item.id] || item.preview;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="min-h-screen pb-20">
      {/* Hero */}
      <div className="relative h-56 bg-navy overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <img src={escudo} alt="" className="w-40 h-40 object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent" />

        {/* Floating header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 safe-top z-10">
          <button onClick={onBack} className="p-2 rounded-full bg-black/20 backdrop-blur-md">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <button className="p-2 rounded-full bg-black/20 backdrop-blur-md">
            <Share2 size={18} className="text-white" />
          </button>
        </div>

        {/* Title over hero */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 z-10">
          <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${categoryColors[item.category]}`}>
            {item.category}
          </span>
          <h1 className="text-xl font-bold text-white leading-tight">{item.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-white/60 text-xs">
            <Clock size={12} />
            <span>{item.time}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-5">
        <div className="prose prose-sm max-w-none">
          {content.split("\n\n").map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="text-sm text-foreground/90 leading-relaxed mb-4"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="px-4 mt-6">
        <h2 className="font-display text-lg text-foreground tracking-wide mb-3">RELACIONADAS</h2>
        <div className="flex flex-col gap-2">
          {related.map((r) => (
            <motion.button
              key={r.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate?.(`news-detail`, { newsId: r.id })}
              className="bg-card rounded-xl p-3 flex gap-3 items-center border border-border/50 text-left w-full"
            >
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <img src={escudo} alt="" className="w-8 h-8 rounded-full opacity-40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-2">{r.title}</p>
                <span className="text-[10px] text-muted-foreground">{r.time}</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default NewsDetailPage;
