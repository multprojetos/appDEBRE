import { useState, useEffect, useRef } from "react";
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
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import escudo from "@/assets/escudo-circle.png";

interface ResenhaPost {
  id: string;
  user_id: string;
  match_id?: string;
  content: string;
  type: "text" | "image" | "audio";
  media_url?: string;
  audio_duration?: number;
  likes: number;
  created_at: string;
  expires_at: string;
  profiles?: {
    name: string;
    avatar_url?: string;
  };
}

interface ResenhaPageProps {
  onBack: () => void;
}

const ResenhaPage = ({ onBack }: ResenhaPageProps) => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<ResenhaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeType, setComposeType] = useState<"text" | "image" | "audio">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    loadPosts();
    // Cleanup expired posts every minute
    const interval = setInterval(cleanupExpiredPosts, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('resenha_comments')
        .select(`
          *,
          profiles:user_id (name, avatar_url)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar resenhas');
    } finally {
      setLoading(false);
    }
  };

  const cleanupExpiredPosts = async () => {
    try {
      // Delete expired posts and their media
      const { data: expired } = await supabase
        .from('resenha_comments')
        .select('id, media_url, type')
        .lt('expires_at', new Date().toISOString());

      if (expired && expired.length > 0) {
        // Delete media files from storage
        for (const post of expired) {
          if (post.media_url && (post.type === 'image' || post.type === 'audio')) {
            const path = post.media_url.split('/').pop();
            if (path) {
              await supabase.storage
                .from('resenha')
                .remove([`${post.type}s/${path}`]);
            }
          }
        }

        // Delete posts from database
        await supabase
          .from('resenha_comments')
          .delete()
          .lt('expires_at', new Date().toISOString());

        // Reload posts
        loadPosts();
      }
    } catch (error) {
      console.error('Error cleaning up expired posts:', error);
    }
  };

  const handleFABClick = () => {
    if (!showCompose) {
      setShowCompose(true);
      setTimeout(() => setShowTypeSelector(true), 100);
    }
  };

  const handleTypeSelect = (type: "text" | "image" | "audio") => {
    setComposeType(type);
    setShowTypeSelector(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mp3' });
        setSelectedFile(audioFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      toast.success('Gravando áudio...');
    } catch (error) {
      toast.error('Erro ao acessar microfone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      toast.success('Gravação finalizada');
    }
  };

  const handleSubmit = async () => {
    if (!user || (!composeText.trim() && !selectedFile)) {
      toast.error('Adicione um texto ou mídia');
      return;
    }

    setUploading(true);
    try {
      let mediaUrl: string | undefined;

      // Upload media if exists
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const bucket = composeType === 'image' ? 'resenha' : 'resenha';
        const folder = composeType === 'image' ? 'images' : 'audios';

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(`${folder}/${fileName}`, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(`${folder}/${fileName}`);

        mediaUrl = publicUrl;
      }

      // Calculate expiration (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create post
      const { error: insertError } = await supabase
        .from('resenha_comments')
        .insert({
          user_id: user.id,
          content: composeText,
          type: composeType,
          media_url: mediaUrl,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) throw insertError;

      toast.success('Resenha publicada! 🔥');
      setShowCompose(false);
      setComposeText('');
      setSelectedFile(null);
      setComposeType('text');
      loadPosts();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao publicar resenha');
    } finally {
      setUploading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const isLiked = likedPosts.has(postId);
    
    try {
      if (isLiked) {
        setLikedPosts(prev => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      } else {
        setLikedPosts(prev => new Set(prev).add(postId));
      }

      // Update likes count in database
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase
          .from('resenha_comments')
          .update({ likes: post.likes + (isLiked ? -1 : 1) })
          .eq('id', postId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const timeRemaining = (expiresAt: string): string => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expirado";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h restantes`;
    return `${mins}min restantes`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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
      <div className="px-4 mt-4 space-y-3 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma resenha ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border/50 overflow-hidden"
            >
              {/* Post header */}
              <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-foreground text-xs font-bold">
                      {post.profiles?.name?.substring(0, 2).toUpperCase() || 'TF'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{post.profiles?.name || 'Torcedor'}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                    <span className="text-[10px] text-accent font-semibold flex items-center gap-0.5">
                      <Clock size={9} />
                      {timeRemaining(post.expires_at)}
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
              {post.content && (
                <div className="px-4 pb-2">
                  <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
                </div>
              )}

              {/* Image */}
              {post.type === "image" && post.media_url && (
                <div className="px-4 pb-2 relative">
                  <img
                    src={post.media_url}
                    alt="Post"
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                  />
                  <a
                    href={post.media_url}
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
              {post.type === "audio" && post.media_url && (
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
                    <a
                      href={post.media_url}
                      download
                      className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                      title="Baixar áudio"
                    >
                      <Download size={13} className="text-primary" />
                    </a>
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
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleFABClick}
        className="fixed bottom-24 right-4 w-14 h-14 bg-accent rounded-full shadow-lg flex items-center justify-center z-40"
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
            onClick={() => {
              setShowCompose(false);
              setShowTypeSelector(false);
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-card rounded-t-2xl border-t border-border p-4 pb-safe"
            >
              {showTypeSelector ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg text-foreground">ESCOLHA O TIPO</h3>
                    <button onClick={() => setShowTypeSelector(false)}>
                      <X size={20} className="text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { type: "text" as const, icon: Send, label: "Texto", desc: "Escreva sua resenha" },
                      { type: "image" as const, icon: ImageIcon, label: "Foto", desc: "Compartilhe uma imagem" },
                      { type: "audio" as const, icon: Mic, label: "Áudio", desc: "Grave sua narração" },
                    ].map((t) => (
                      <button
                        key={t.type}
                        onClick={() => handleTypeSelect(t.type)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted/70 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <t.icon size={18} className="text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t.label}</p>
                          <p className="text-xs text-muted-foreground">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg text-foreground">NOVA RESENHA</h3>
                    <button onClick={() => setShowCompose(false)}>
                      <X size={20} className="text-muted-foreground" />
                    </button>
                  </div>

                  {/* Text input */}
                  <textarea
                    value={composeText}
                    onChange={(e) => setComposeText(e.target.value)}
                    placeholder="Manda a resenha, torcedor..."
                    className="w-full h-28 bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring mb-3"
                  />

                  {/* Image upload */}
                  {composeType === "image" && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted/20 transition-colors mb-3"
                      >
                        <ImageIcon size={18} />
                        {selectedFile ? selectedFile.name : 'Toque para adicionar foto'}
                      </button>
                    </>
                  )}

                  {/* Audio recording */}
                  {composeType === "audio" && (
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      className={`w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm transition-colors mb-3 ${
                        recording
                          ? 'border-destructive bg-destructive/10 text-destructive'
                          : 'border-border text-muted-foreground hover:bg-muted/20'
                      }`}
                    >
                      <Mic size={18} />
                      {recording ? 'Toque para parar gravação' : selectedFile ? 'Áudio gravado' : 'Toque para gravar áudio'}
                    </button>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={uploading || (!composeText.trim() && !selectedFile)}
                    className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-bold text-sm disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      'Publicar Resenha 🔥'
                    )}
                  </button>

                  <p className="text-center text-[10px] text-muted-foreground mt-2">
                    Sua resenha ficará visível por 24 horas
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResenhaPage;
