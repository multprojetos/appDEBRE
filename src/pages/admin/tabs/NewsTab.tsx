import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadNewsImage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface News {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  image_url?: string;
  category: string;
  published: boolean;
  featured: boolean;
  created_at: string;
}

export default function NewsTab({ search }: { search: string }) {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    content: "",
    image_url: "",
    category: "geral",
    published: false,
    featured: false,
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar notícias");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      title: "",
      subtitle: "",
      content: "",
      image_url: "",
      category: "geral",
      published: false,
      featured: false,
    });
    setModalOpen(true);
  };

  const openEdit = (item: News) => {
    setEditing(item);
    setForm({
      title: item.title,
      subtitle: item.subtitle || "",
      content: item.content,
      image_url: item.image_url || "",
      category: item.category,
      published: item.published,
      featured: item.featured,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadNewsImage(file, editing?.id);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Imagem enviada!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Preencha título e conteúdo");
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...form,
        author_id: user?.id,
        published_at: form.published ? new Date().toISOString() : null,
      };

      if (editing) {
        const { error } = await supabase
          .from("news")
          .update(data)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Notícia atualizada!");
      } else {
        const { error } = await supabase.from("news").insert(data);
        if (error) throw error;
        toast.success("Notícia criada!");
      }

      setModalOpen(false);
      loadNews();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar esta notícia?")) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
      toast.success("Notícia deletada");
      loadNews();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = news.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <>
      <div className="px-4">
        <Button onClick={openNew} className="w-full mb-4">
          <Plus size={16} className="mr-2" />
          Nova Notícia
        </Button>

        <div className="flex flex-col gap-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3"
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {item.category}
                  </span>
                  {item.published && (
                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                      Publicada
                    </span>
                  )}
                  {item.featured && (
                    <span className="text-xs">🔥</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => openEdit(item)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <Pencil size={14} className="text-gold" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <Trash2 size={14} className="text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-[430px] bg-card rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-foreground">
                  {editing ? "EDITAR NOTÍCIA" : "NOVA NOTÍCIA"}
                </h2>
                <button onClick={() => setModalOpen(false)}>
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Título da notícia"
                  />
                </div>

                <div>
                  <Label>Subtítulo</Label>
                  <Input
                    value={form.subtitle}
                    onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                    placeholder="Subtítulo (opcional)"
                  />
                </div>

                <div>
                  <Label>Conteúdo *</Label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="Conteúdo completo da notícia"
                    rows={6}
                  />
                </div>

                <div>
                  <Label>Imagem de Capa</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} className="mr-2" />
                        {form.image_url ? "Alterar Imagem" : "Adicionar Imagem"}
                      </>
                    )}
                  </Button>
                  {form.image_url && (
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="mt-2 w-full h-32 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div>
                  <Label>Categoria</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm"
                  >
                    <option value="geral">Geral</option>
                    <option value="jogo">Jogo</option>
                    <option value="elenco">Elenco</option>
                    <option value="bastidores">Bastidores</option>
                    <option value="torcida">Torcida</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, published: e.target.checked }))
                      }
                      className="rounded"
                    />
                    Publicar agora
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, featured: e.target.checked }))
                      }
                      className="rounded"
                    />
                    Marcar como 🔥 Destaque
                  </label>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : editing ? (
                    "Salvar Alterações"
                  ) : (
                    "Publicar Notícia"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
