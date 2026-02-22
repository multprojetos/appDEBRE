import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Newspaper, 
  Users, 
  Calendar, 
  ShoppingBag, 
  LogOut, 
  Home,
  Bell,
  Image as ImageIcon,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import NewsTab from "./tabs/NewsTab";
import PlayersTab from "./tabs/PlayersTab";
import MatchesTab from "./tabs/MatchesTab";
import ProductsTab from "./tabs/ProductsTab";
import escudo from "@/assets/escudo-circle.png";

type AdminTab = "noticias" | "elenco" | "jogos" | "produtos";

const tabs: { id: AdminTab; label: string; icon: typeof Newspaper; color: string }[] = [
  { id: "noticias", label: "Notícias", icon: Newspaper, color: "bg-blue-500" },
  { id: "elenco", label: "Elenco", icon: Users, color: "bg-green-500" },
  { id: "jogos", label: "Jogos", icon: Calendar, color: "bg-purple-500" },
  { id: "produtos", label: "Manto", icon: ShoppingBag, color: "bg-amber-500" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("noticias");
  const [stats, setStats] = useState({
    news: 0,
    players: 0,
    matches: 0,
    products: 0,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Acesso negado. Apenas administradores.");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Load stats with real-time updates
  useEffect(() => {
    loadStats();

    // Subscribe to real-time changes
    const newsChannel = supabase
      .channel('admin-news-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, loadStats)
      .subscribe();

    const playersChannel = supabase
      .channel('admin-players-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, loadStats)
      .subscribe();

    const matchesChannel = supabase
      .channel('admin-matches-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, loadStats)
      .subscribe();

    const productsChannel = supabase
      .channel('admin-products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadStats)
      .subscribe();

    return () => {
      supabase.removeChannel(newsChannel);
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  const loadStats = async () => {
    try {
      const [newsRes, playersRes, matchesRes, productsRes] = await Promise.all([
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        news: newsRes.count || 0,
        players: playersRes.count || 0,
        matches: matchesRes.count || 0,
        products: productsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-card border-r border-border flex flex-col fixed h-full z-50"
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={escudo} alt="Debreceni FC" className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="font-display text-lg text-foreground">ADMIN</h1>
              <p className="text-xs text-muted-foreground">Painel de Controle</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4 space-y-2">
          {[
            { label: "Notícias", value: stats.news, icon: Newspaper, color: "text-blue-500" },
            { label: "Jogadores", value: stats.players, icon: Users, color: "text-green-500" },
            { label: "Jogos", value: stats.matches, icon: Calendar, color: "text-purple-500" },
            { label: "Produtos", value: stats.products, icon: ShoppingBag, color: "text-amber-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-muted/30 rounded-lg p-3 flex items-center gap-3">
              <stat.icon size={20} className={stat.color} />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-gold text-white"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-foreground text-xs font-bold">
                  {profile?.name?.substring(0, 2).toUpperCase() || 'AD'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{profile?.name || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground">Administrador</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Home size={16} />
            Voltar ao App
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-foreground">
                  {tabs.find(t => t.id === activeTab)?.label.toUpperCase()}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Gerencie {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} do aplicativo
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-600">Tempo Real</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "noticias" && <NewsTab search="" />}
            {activeTab === "elenco" && <PlayersTab search="" />}
            {activeTab === "jogos" && <MatchesTab search="" />}
            {activeTab === "produtos" && <ProductsTab search="" />}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
