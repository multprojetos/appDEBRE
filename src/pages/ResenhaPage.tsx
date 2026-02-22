import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Mic,
  Send,
  Heart,
  MessageCircle,
  Clock,
  X,
  Play,
  Pause,
  Download,
} from "lucide-react";
import escudo from "@/assets/escudo-circle.png";

interface ResenhaPost {
  id: string;
  author: string;
  authorInitials: string;
  type: "text" | "image" | "audio";
  content: string;
  imageUrl?: string;
  audioDuration?: string;
  likes: number;
  comments: number;
  createdAt: Date;
  expiresAt: Date;
}

const mockPosts: ResenhaPost[] = [
  {
    id: "1",
    author: "Marcos Torcedor",
    authorInitials: "MT",
    type: "text",
    content: "Que jogaço ontem! O Rodrigo tá demais, 2 gols e ainda deu aquela caneta no zagueiro. BORA DEBRÊ! 🔥⚽",
    likes: 24,
    comments: 8,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
  },
  {
    id: "2",
    author: "Ana Carolina",
    authorInitials: "AC",
    type: "image",
    content: "Olha a torcida ontem! Campo do Debrê lotado 🏟️",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
    likes: 41,
    comments: 12,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000),
  },
  {
    id: "3",
    author: "Pedro Fanático",
    authorInitials: "PF",
    type: "audio",
    content: "Narração do gol do Marquinhos!",
    audioDuration: "0:34",
    likes: 18,
    comments: 5,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000),
  },
  {
    id: "4",
    author: "Lucas Debrê",
    authorInitials: "LD",
    type: "text",
    content: "Quem vai domingo? Partida decisiva contra o Vila Nova! Bora lotar o campo 💪",
    likes: 33,
    comments: 15,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
  },
  {
    id: "5",
    author: "Juliana FC",
    authorInitials: "JF",
    type: "image",
    content: "Meu manto novo chegou! Ficou lindo demais 😍",
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=300&fit=crop",
    likes: 56,
    comments: 20,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
  },
];

function timeRemaining(expiresAt: Date): string {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return "Expirado";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h restantes`;
  return `${mins}min restantes`;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  return `${hours}h`;
}

interface ResenhaPageProps {
  onBack: () => void;
}

const ResenhaPage = ({ onBack }: ResenhaPageProps) => {
  const [showCompose, setShowCompose] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeType, setComposeType] = useState<"text" | "image" | "audio">("text");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 -ml-1">
              <ArrowLeft size={22} className="text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <img src={escudo} alt="Debreceni FC" className="w-7 h-7 rounded-full object-cover" />
              <div>
                <h1 className="font-display text-lg text-foreground leading-tight">RESENHA DO DEBRE</h1>
                <p className="text-[10px] text-muted-foreground">Posts expiram em 24h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 flex items-center gap-2">
        <Clock size={14} className="text-accent flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          Tudo aqui dura <span className="font-bold text-foreground">24 horas</span> — aproveite pra mandar aquela resenha!
        </p>
      </div>

      {/* Feed */}
      <div className="px-4 mt-4 space-y-3">
        {mockPosts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border/50 overflow-hidden"
          >
            {/* Post header */}
            <div className="flex items-center gap-3 px-4 pt-3 pb-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground text-xs font-bold">{post.authorInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{post.author}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{timeAgo(post.createdAt)} atrás</span>
                  <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
                    <Clock size={9} />
                    {timeRemaining(post.expiresAt)}
                  </span>
                </div>
              </div>
              {post.type === "audio" && (
                <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                  🎙 ÁUDIO
                </span>
              )}
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
              <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
            </div>

            {/* Image */}
            {post.type === "image" && post.imageUrl && (
              <div className="px-4 pb-2 relative">
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full h-48 object-cover rounded-lg"
                  loading="lazy"
                />
                <a
                  href={post.imageUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-6 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center active:bg-black/80 transition-colors"
                >
                  <Download size={14} className="text-white" />
                </a>
              </div>
            )}

            {/* Audio player */}
            {post.type === "audio" && (
              <div className="px-4 pb-2">
                <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2.5">
                  <button
                    onClick={() => setPlayingAudio(playingAudio === post.id ? null : post.id)}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                  >
                    {playingAudio === post.id ? (
                      <Pause size={14} className="text-primary-foreground" />
                    ) : (
                      <Play size={14} className="text-primary-foreground ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: playingAudio === post.id ? "45%" : "0%" }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">{post.audioDuration}</span>
                  <button
                    className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                    title="Baixar áudio"
                  >
                    <Download size={13} className="text-primary" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 px-4 py-2 border-t border-border/30">
              <button
                onClick={() => toggleLike(post.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted/40 transition-colors"
              >
                <Heart
                  size={16}
                  className={likedPosts.has(post.id) ? "text-destructive fill-destructive" : "text-muted-foreground"}
                />
                <span className="text-xs text-muted-foreground font-semibold">
                  {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                </span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted/40 transition-colors">
                <MessageCircle size={16} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-semibold">{post.comments}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowCompose(true)}
        className="fixed bottom-24 right-1/2 translate-x-[calc(50%+170px)] w-14 h-14 bg-accent rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <Plus size={24} className="text-accent-foreground" />
      </motion.button>

      {/* Compose modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-card rounded-t-2xl border-t border-border p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg text-foreground">NOVA RESENHA</h3>
                <button onClick={() => setShowCompose(false)}>
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {/* Type selector */}
              <div className="flex gap-2 mb-4">
                {[
                  { type: "text" as const, icon: Send, label: "Texto" },
                  { type: "image" as const, icon: ImageIcon, label: "Foto" },
                  { type: "audio" as const, icon: Mic, label: "Áudio" },
                ].map((t) => (
                  <button
                    key={t.type}
                    onClick={() => setComposeType(t.type)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                      composeType === t.type
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <t.icon size={14} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Text input */}
              <textarea
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                placeholder="Manda a resenha, torcedor..."
                className="w-full h-28 bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />

              {/* Image/Audio extras */}
              {composeType === "image" && (
                <button className="mt-3 w-full py-3 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted/20 transition-colors">
                  <ImageIcon size={18} />
                  Toque para adicionar foto
                </button>
              )}
              {composeType === "audio" && (
                <button className="mt-3 w-full py-3 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted/20 transition-colors">
                  <Mic size={18} />
                  Segure para gravar áudio
                </button>
              )}

              {/* Submit */}
              <button
                disabled={!composeText.trim()}
                className="mt-4 w-full py-3 bg-accent text-accent-foreground rounded-xl font-bold text-sm disabled:opacity-40 transition-opacity"
              >
                Publicar Resenha 🔥
              </button>

              <p className="text-center text-[10px] text-muted-foreground mt-2">
                Sua resenha ficará visível por 24 horas
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResenhaPage;
