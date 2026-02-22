import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadPlayerPhoto } from "@/lib/storage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Player {
  id: string;
  name: string;
  number?: number;
  position: string;
  photo_url?: string;
  birth_date?: string;
  nationality?: string;
  height?: number;
  weight?: number;
  status: string;
  bio?: string;
}

export default function PlayersTab({ search }: { search: string }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    name: "",
    number: "",
    position: "Atacante",
    photo_url: "",
    birth_date: "",
    nationality: "Brasil",
    height: "",
    weight: "",
    status: "ativo",
    bio: "",
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("number", { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar jogadores");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
      number: "",
      position: "Atacante",
      photo_url: "",
      birth_date: "",
      nationality: "Brasil",
      height: "",
      weight: "",
      status: "ativo",
      bio: "",
    });
    setModalOpen(true);
  };

  const openEdit = (item: Player) => {
    setEditing(item);
    setForm({
      name: item.name,
      number: item.number?.toString() || "",
      position: item.position,
      photo_url: item.photo_url || "",
      birth_date: item.birth_date || "",
      nationality: item.nationality || "Brasil",
      height: item.height?.toString() || "",
      weight: item.weight?.toString() || "",
      status: item.status,
      bio: item.bio || "",
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadPlayerPhoto(file, editing?.id);
      setForm((f) => ({ ...f, photo_url: url }));
      toast.success("Foto enviada!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Preencha o nome do jogador");
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: form.name,
        number: form.number ? parseInt(form.number) : null,
        position: form.position,
        photo_url: form.photo_url || null,
        birth_date: form.birth_date || null,
        nationality: form.nationality,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        status: form.status,
        bio: form.bio || null,
      };

      if (editing) {
        const { error } = await supabase
          .from("players")
          .update(data)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Jogador atualizado!");
      } else {
        const { error } = await supabase.from("players").insert(data);
        if (error) throw error;
        toast.success("Jogador adicionado!");
      }

      setModalOpen(false);
      loadPlayers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este jogador?")) return;

    try {
      const { error } = await supabase.from("players").delete().eq("id", id);
      if (error) throw error;
      toast.success("Jogador deletado");
      loadPlayers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = players.filter((p) =>
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
          Novo Jogador
        </Button>

        <div className="flex flex-col gap-2">
          {filtered.map((player) => (
            <div
              key={player.id}
              className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center overflow-hidden flex-shrink-0">
                {player.photo_url ? (
                  <img src={player.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gold font-bold text-sm">
                    {player.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {player.number && `#${player.number} `}
                  {player.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{player.position}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      player.status === "ativo"
                        ? "bg-success/20 text-success"
                        : player.status === "lesionado"
                        ? "bg-destructive/20 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {player.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => openEdit(player)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <Pencil size={14} className="text-gold" />
              </button>
              <button
                onClick={() => handleDelete(player.id)}
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
                  {editing ? "EDITAR JOGADOR" : "NOVO JOGADOR"}
                </h2>
                <button onClick={() => setModalOpen(false)}>
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <Label>Foto do Jogador</Label>
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
                        {form.photo_url ? "Alterar Foto" : "Adicionar Foto"}
                      </>
                    )}
                  </Button>
                  {form.photo_url && (
                    <img
                      src={form.photo_url}
                      alt="Preview"
                      className="mt-2 w-24 h-24 object-cover rounded-full mx-auto"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Nome do jogador"
                    />
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input
                      type="number"
                      value={form.number}
                      onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Posição *</Label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm"
                  >
                    <option value="Goleiro">Goleiro</option>
                    <option value="Zagueiro">Zagueiro</option>
                    <option value="Lateral">Lateral</option>
                    <option value="Meio-campo">Meio-campo</option>
                    <option value="Atacante">Atacante</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Data de Nascimento</Label>
                    <Input
                      type="date"
                      value={form.birth_date}
                      onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Nacionalidade</Label>
                    <Input
                      value={form.nationality}
                      onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
                      placeholder="Brasil"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Altura (m)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.height}
                      onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                      placeholder="1.80"
                    />
                  </div>
                  <div>
                    <Label>Peso (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.weight}
                      onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                      placeholder="75.5"
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="lesionado">Lesionado</option>
                    <option value="suspenso">Suspenso</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <Label>Biografia</Label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Informações sobre o jogador..."
                    rows={3}
                  />
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
                    "Adicionar Jogador"
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
