import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Newspaper, Users, Calendar, ShoppingBag } from "lucide-react";
import NewsTab from "./tabs/NewsTab";
import PlayersTab from "./tabs/PlayersTab";
import MatchesTab from "./tabs/MatchesTab";
import ProductsTab from "./tabs/ProductsTab";

interface AdminPageProps {
  onBack: () => void;
}

type AdminTab = "noticias" | "elenco" | "jogos" | "produtos";

const tabs: { id: AdminTab; label: string; icon: typeof Newspaper }[] = [
  { id: "noticias", label: "Notícias", icon: Newspaper },
  { id: "elenco", label: "Elenco", icon: Users },
  { id: "jogos", label: "Jogos", icon: Calendar },
  { id: "produtos", label: "Manto", icon: ShoppingBag },
];

const AdminPage = ({ onBack }: AdminPageProps) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("noticias");
  const [search, setSearch] = useState("");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-4 safe-top flex items-center gap-3 sticky top-0 bg-background z-10 pb-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <h1 className="font-display text-2xl text-foreground tracking-wide">PAINEL ADMIN</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-3 overflow-x-auto sticky top-16 bg-background z-10 pb-3">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch("");
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-gold text-white" : "bg-card text-foreground border border-border"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === "noticias" && <NewsTab search={search} />}
        {activeTab === "elenco" && <PlayersTab search={search} />}
        {activeTab === "jogos" && <MatchesTab search={search} />}
        {activeTab === "produtos" && <ProductsTab search={search} />}
      </div>
    </motion.div>
  );
};

export default AdminPage;
