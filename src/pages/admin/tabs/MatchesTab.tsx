import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  match_date: string;
  competition: string;
  stadium?: string;
  status: string;
  summary?: string;
}

export default function MatchesTab({ search }: { search: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    home_team: "Debreceni FC",
    away_team: "",
    home_score: "",
    away_score: "",
    match_date: "",
    competition: "Campeonato Municipal",
    stadium: "Campo do Debrê",
    status: "scheduled",
    summary: "",
  });

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar jogos");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      home_team: "Debreceni FC",
      away_team: "",
      home_score: "",
      away_score: "",
      match_date: "",
      competition: "Campeonato Municipal",
      stadium: "Campo do Debrê",
      status: "scheduled",
      summary: "",
    });
    setModalOpen(true);
  };

  const openEdit = (item: Match) => {
    setEditing(item);
    setForm({
      home_team: item.home_team,
      away_team: item.away_team,
      home_score: item.home_score?.toString() || "",
      away_score: item.away_score?.toString() || "",
      match_date: item.match_date,
      competition: item.competition,
      stadium: item.stadium || "",
      status: item.status,
      summary: item.summary || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.away_team.trim() || !form.match_date) {
      toast.error("Preencha time adversário e data");
      return;
    }

    setSaving(true);
    try {
      const data = {
        home_team: form.home_team,
        away_team: form.away_team,
        home_score: form.home_score ? parseInt(form.home_score) : null,
        away_score: form.away_score ? parseInt(form.away_score) : null,
        match_date: form.match_date,
        competition: form.competition,
        stadium: form.stadium || null,
        status: form.status,
        summary: form.summary || null,
      };

      if (editing) {
        const { error } = await supabase
          .from("matches")
          .update(data)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Jogo atualizado!");
      } else {
        const { error } = await supabase.from("matches").insert(data);
        if (error) throw error;
        toast.success("Jogo criado!");
      }

      setModalOpen(false);
      loadMatches();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este jogo?")) return;

    try {
      const { error } = await supabase.from("matches").delete().eq("id", id);
      if (error) throw error;
      toast.success("Jogo deletado");
      loadMatches();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered = matches.filter((m) =>
    `${m.home_team} ${m.away_team}`.toLowerCase().includes(search.toLowerCase())
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
          Novo Jogo
        </Button>

        <div className="flex flex-col gap-2">
          {filtered.map((match) => (
            <div
              key={match.id}
              className="bg-card rounded-xl p-3 border border-border/50"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">
                  {match.home_team} x {match.away_team}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(match)}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <Pencil size={14} className="text-gold" />
                  </button>
                  <button
                    onClick={() => handleDelete(match.id)}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{new Date(match.match_date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{match.competition}</span>
                {match.home_score !== null && match.away_score !== null && (
                  <>
                    <span>•</span>
                    <span className="font-bold text-gold">
                      {match.home_score} x {match.away_score}
                    </span>
                  </>
                )}
              </div>
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
                  {editing ? "EDITAR JOGO" : "NOVO JOGO"}
                </h2>
                <button onClick={() => setModalOpen(false)}>
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Time Casa *</Label>
                    <Input
                      value={form.home_team}
                      onChange={(e) => setForm((f) => ({ ...f, home_team: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Time Visitante *</Label>
                    <Input
                      value={form.away_team}
                      onChange={(e) => setForm((f) => ({ ...f, away_team: e.target.value }))}
                      placeholder="Adversário"
                    />
                  </div>
                </div>

                <div>
                  <Label>Data e Hora *</Label>
                  <Input
                    type="datetime-local"
                    value={form.match_date}
                    onChange={(e) => setForm((f) => ({ ...f, match_date: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Placar Casa</Label>
                    <Input
                      type="number"
                      value={form.home_score}
                      onChange={(e) => setForm((f) => ({ ...f, home_score: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Placar Visitante</Label>
                    <Input
                      type="number"
                      value={form.away_score}
                      onChange={(e) => setForm((f) => ({ ...f, away_score: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>Competição</Label>
                  <Input
                    value={form.competition}
                    onChange={(e) => setForm((f) => ({ ...f, competition: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Estádio</Label>
                  <Input
                    value={form.stadium}
                    onChange={(e) => setForm((f) => ({ ...f, stadium: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm"
                  >
                    <option value="scheduled">Agendado</option>
                    <option value="live">Ao Vivo</option>
                    <option value="finished">Finalizado</option>
                    <option value="postponed">Adiado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div>
                  <Label>Resumo</Label>
                  <Textarea
                    value={form.summary}
                    onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                    placeholder="Resumo do jogo..."
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
                    "Criar Jogo"
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
