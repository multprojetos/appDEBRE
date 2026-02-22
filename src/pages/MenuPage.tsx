import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import escudo from "@/assets/escudo-circle.png";
import {
  Image,
  Clock,
  Newspaper,
  ShoppingBag,
  Mic,
  Trophy,
  MapPin,
  User,
  Bell,
  LogOut,
  ChevronRight,
  Pencil,
  BarChart3,
  Crown,
  CalendarDays,
  Settings,
} from "lucide-react";

const menuSections = [
  {
    title: "CLUBE E CONTEÚDO",
    items: [
      { icon: Image, label: "Galeria de Fotos", desc: "Fotos dos jogos e eventos", color: "text-blue-500", page: "galeria" },
      { icon: CalendarDays, label: "Calendário", desc: "Jogos e resultados", color: "text-accent", page: "calendario" },
      { icon: Clock, label: "História do Debreceni", desc: "Desde 2009 fazendo história", color: "text-accent" },
      { icon: Newspaper, label: "Notícias", desc: "Fique por dentro de tudo", color: "text-primary" },
      { icon: ShoppingBag, label: "Manto Sagrado", desc: "Uniformes e merchandising", color: "text-accent", page: "manto" },
    ],
  },
  {
    title: "INTERAÇÃO DO TORCEDOR",
    items: [
      { icon: Mic, label: "Resenha do Debre", desc: "Comente e opine nos jogos", color: "text-orange-500", page: "resenha" },
      { icon: Trophy, label: "Votação Fanático", desc: "Escolha o craque da partida", color: "text-accent", page: "votacao" },
      { icon: BarChart3, label: "Enquetes", desc: "Vote e opine nas decisões", color: "text-blue-500", page: "enquetes" },
      { icon: Crown, label: "Ranking Fanático", desc: "Classificação dos torcedores", color: "text-accent", page: "ranking" },
      { icon: MapPin, label: "Parceiros de Desconto", desc: "Benefícios para torcedores", color: "text-green-600" },
    ],
  },
  {
    title: "ADMINISTRAÇÃO E CONTA",
    items: [
      { icon: Settings, label: "Painel Admin", desc: "Gerenciar conteúdo do app", color: "text-gold", page: "admin" },
      { icon: User, label: "Editar Perfil", desc: "Alterar nome e foto", color: "text-foreground", page: "edit-profile" },
      { icon: Bell, label: "Notificações", desc: "Ver suas notificações", color: "text-foreground", page: "notifications" },
    ],
  },
];

interface MenuPageProps {
  onNavigate?: (page: string) => void;
}

const MenuPage = ({ onNavigate }: MenuPageProps) => {
  const { user, profile, signOut, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  // Filter admin section if not admin
  const filteredSections = menuSections.map(section => {
    if (section.title === "ADMINISTRAÇÃO E CONTA" && !isAdmin) {
      return {
        ...section,
        items: section.items.filter(item => item.label !== "Painel Admin")
      };
    }
    return section;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="min-h-screen pb-20"
    >
      {/* Header */}
      <div className="px-4 pt-4 safe-top flex items-center gap-3">
        <img src={escudo} alt="Debreceni FC" className="w-8 h-8 rounded-full object-cover" />
        <h1 className="font-display text-2xl text-foreground tracking-wide">
          MENU
        </h1>
      </div>

      {/* User profile card */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border/50 flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center">
              <span className="text-gold font-bold text-xl">
                {profile?.name?.substring(0, 2).toUpperCase() || 'TF'}
              </span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
              <Pencil size={12} className="text-white" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-foreground text-lg">{profile?.name || 'Torcedor'}</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[11px] font-bold mt-0.5">
              {isAdmin ? '👑 ADMINISTRADOR' : '⭐ TORCEDOR REGISTRADO'}
            </span>
            <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu sections */}
      {filteredSections.map((section) => (
        <div key={section.title} className="px-4 mt-5">
          <h3 className="text-[11px] font-bold text-muted-foreground tracking-wider mb-2">
            {section.title}
          </h3>
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            {section.items.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => {
                  if ((item as any).page && onNavigate) {
                    onNavigate((item as any).page);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors ${
                  idx < section.items.length - 1 ? "border-b border-border/40" : ""
                }`}
              >
                <div className="relative">
                  <item.icon size={20} className={item.color} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="px-4 mt-5">
        <button 
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-semibold flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors"
        >
          <LogOut size={16} />
          Sair da Conta
        </button>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center py-8 gap-2">
        <img src={escudo} alt="Debreceni FC" className="w-8 h-8 rounded-full object-cover" />
        <p className="text-[11px] text-muted-foreground font-semibold">DEBRE NA REDE V2.5.0</p>
        <p className="text-[10px] text-muted-foreground/60">Designed with Passion in Carmo-RJ</p>
      </div>
    </motion.div>
  );
};

export default MenuPage;
