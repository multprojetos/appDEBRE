import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadProductImage } from "@/lib/storage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  stock: number;
  available: boolean;
  featured: boolean;
}

export default function ProductsTab({ search }: { search: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "uniforme",
    image_url: "",
    stock: "",
    available: true,
    featured: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "uniforme",
      image_url: "",
      stock: "",
      available: true,
      featured: false,
    });
    setModalOpen(true);
  };

  const openEdit = (item: Product) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || "",
      stock: item.stock.toString(),
      available: item.available,
      featured: item.featured,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadProductImage(file, editing?.id);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Imagem enviada!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Preencha nome e preço");
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        category: form.category,
        image_url: form.image_url || null,
        stock: form.stock ? parseInt(form.stock) : 0,
        available: form.available,
        featured: form.featured,
      };

      if (editing) {
        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Produto atualizado!");
      } else {
        const { error } = await supabase.from("products").insert(data);
        if (error) throw error;
        toast.success("Produto criado!");
      }

      setModalOpen(false);
      loadProducts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este produto?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Produto deletado");
      loadProducts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
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
          Novo Produto
        </Button>

        <div className="flex flex-col gap-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-gold">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {product.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Estoque: {product.stock}
                  </span>
                  {!product.available && (
                    <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                      Indisponível
                    </span>
                  )}
                  {product.featured && <span className="text-xs">⭐</span>}
                </div>
              </div>
              <button
                onClick={() => openEdit(product)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <Pencil size={14} className="text-gold" />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
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
              className="w-full max-w-[430px] bg-card rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto pb-safe"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-foreground">
                  {editing ? "EDITAR PRODUTO" : "NOVO PRODUTO"}
                </h2>
                <button onClick={() => setModalOpen(false)}>
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <Label>Imagem do Produto</Label>
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
                  <Label>Nome do Produto *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Uniforme Titular 2026"
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Descrição do produto..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Preço (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="99.90"
                    />
                  </div>
                  <div>
                    <Label>Estoque</Label>
                    <Input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Categoria</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm"
                  >
                    <option value="uniforme">Uniforme</option>
                    <option value="agasalho">Agasalho</option>
                    <option value="acessorio">Acessório</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, available: e.target.checked }))
                      }
                      className="rounded"
                    />
                    Disponível para venda
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
                    Produto em destaque ⭐
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
                    "Criar Produto"
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
