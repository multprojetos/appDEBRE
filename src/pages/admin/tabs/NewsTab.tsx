import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Loader2, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadNewsImage } from "@/lib/storage";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface News {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  image_url?: string;
  category: string;
  published: boolean;
  featured: boolean;
  created_at: string;
}

interface NewsTabProps {
  search: string;
}

const NewsTab = ({ search }: NewsTabProps) => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: "geral",
    published: true,
    featured: false,
  });

  useEffect(() => {
    loadNews();

    // Real-time subscription
    const channel = supabase
      .channel('news-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => {
        loadNews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openModal = (newsItem?: News) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setFormData({
        title: newsItem.title,
        subtitle: newsItem.subtitle || "",
        content: newsItem.content,
        category: newsItem.category,
        published: newsItem.published,
        featured: newsItem.featured,
      });
      setImagePreview(newsItem.image_url || "");
    } else {
      setEditingNews(null);
      setFormData({
        title: "",
        subtitle: "",
        content: "",
        category: "geral",
        published: true,
        featured: false,
      });
      setImagePreview("");
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNews(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Preencha o título');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = editingNews?.image_url;

      if (imageFile) {
        imageUrl = await uploadNewsImage(imageFile);
      }

      const newsData = {
        ...formData,
        image_url: imageUrl,
      };

      if (editingNews) {
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingNews.id);

        if (error) throw error;
        toast.success('Notícia atualizada! ✅');
      } else {
        const { error } = await supabase
          .from('news')
          .insert([newsData]);

        if (error) throw error;
        toast.success('Notícia criada! ✅');
      }

      closeModal();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar notícia');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Notícia excluída');
    } catch (error: any) {
      toast.error('Erro ao excluir notícia');
    }
  };

  const togglePublish = async (newsItem: News) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ published: !newsItem.published })
        .eq('id', newsItem.id);

      if (error) throw error;
      toast.success(newsItem.published ? 'Notícia despublicada' : 'Notícia publicada');
    } catch (error: any) {
      toast.error('Erro ao atualizar status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors"
        >
          <Plus size={18} />
          Nova Notícia
        </button>
      </div>

      {/* News List */}
      <div className="grid gap-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma notícia encontrada</p>
          </div>
        ) : (
          filteredNews.map((newsItem) => (
            <motion.div
              key={newsItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-gold/50 transition-colors"
            >
              <div className="flex gap-4">
                {newsItem.image_url && (
                  <img
                    src={newsItem.image_url}
                    alt={newsItem.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{newsItem.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{newsItem.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {newsItem.featured && (
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                      )}
                      {newsItem.published ? (
                        <Eye size={14} className="text-green-500" />
                      ) : (
                        <EyeOff size={14} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {newsItem.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(newsItem.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(newsItem)}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <Edit size={12} className="inline mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => togglePublish(newsItem)}
                      className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-semibold hover:bg-muted/70 transition-colors"
                    >
                      {newsItem.published ? <EyeOff size={12} className="inline mr-1" /> : <Eye size={12} className="inline mr-1" />}
                      {newsItem.published ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button
                      onClick={() => handleDelete(newsItem.id)}
                      className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-semibold hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 size={12} className="inline mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto pb-safe"
            >
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                <h3 className="font-display text-xl text-foreground">
                  {editingNews ? 'EDITAR NOTÍCIA' : 'NOVA NOTÍCIA'}
                </h3>
                <button onClick={closeModal} className="p-1 hover:bg-muted rounded-lg transition-colors">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Imagem</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="block w-full h-40 border-2 border-dashed border-border rounded-xl hover:bg-muted/20 transition-colors overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <ImageIcon size={32} className="text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Clique para adicionar imagem</p>
                      </div>
                    )}
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Título da notícia"
                    required
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Subtítulo</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Subtítulo ou resumo"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Conteúdo</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                    placeholder="Conteúdo completo da notícia"
                    rows={6}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="geral">Geral</option>
                    <option value="jogo">Jogo</option>
                    <option value="elenco">Elenco</option>
                    <option value="bastidores">Bastidores</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">Publicar</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">Destaque</span>
                  </label>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/70 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2.5 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      editingNews ? 'Atualizar' : 'Criar'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsTab;
