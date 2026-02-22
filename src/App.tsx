import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import BottomNav, { type TabId } from "@/components/BottomNav";
import HomePage from "@/pages/HomePage";
import NewsPage from "@/pages/NewsPage";
import SquadPage from "@/pages/SquadPage";
import StatsPage from "@/pages/StatsPage";
import MenuPage from "@/pages/MenuPage";
import ResenhaPage from "@/pages/ResenhaPage";
import VotacaoPage from "@/pages/VotacaoPage";
import EnquetesPage from "@/pages/EnquetesPage";
import RankingPage from "@/pages/RankingPage";
import GaleriaPage from "@/pages/GaleriaPage";
import CalendarioPage from "@/pages/CalendarioPage";
import MantoPage from "@/pages/MantoPage";
import AdminPage from "@/pages/AdminPage";
import NewsDetailPage from "@/pages/NewsDetailPage";

const queryClient = new QueryClient();

type AppPage = { type: "tab"; tab: TabId } | { type: "subpage"; page: string; data?: any };

const pages: Record<TabId, React.FC<{ onNavigate?: (page: string, data?: any) => void }>> = {
  home: HomePage,
  news: NewsPage,
  squad: SquadPage,
  stats: StatsPage,
  more: MenuPage,
};

const App = () => {
  const [activePage, setActivePage] = useState<AppPage>({ type: "tab", tab: "home" });

  const activeTab = activePage.type === "tab" ? activePage.tab : "more";

  const handleTabChange = (tab: TabId) => {
    setActivePage({ type: "tab", tab });
  };

  const handleNavigate = (page: string, data?: any) => {
    setActivePage({ type: "subpage", page, data });
  };

  const handleBack = () => {
    setActivePage({ type: "tab", tab: "more" });
  };

  const handleBackToNews = () => {
    setActivePage({ type: "tab", tab: "news" });
  };

  const handleBackToHome = () => {
    setActivePage({ type: "tab", tab: "home" });
  };

  const renderPage = () => {
    if (activePage.type === "subpage") {
      const data = activePage.data;
      switch (activePage.page) {
        case "resenha":
          return <ResenhaPage key="resenha" onBack={handleBack} />;
        case "votacao":
          return <VotacaoPage key="votacao" onBack={handleBack} />;
        case "enquetes":
          return <EnquetesPage key="enquetes" onBack={handleBack} />;
        case "ranking":
          return <RankingPage key="ranking" onBack={handleBack} />;
        case "galeria":
          return <GaleriaPage key="galeria" onBack={handleBack} />;
        case "calendario":
          return <CalendarioPage key="calendario" onBack={handleBack} />;
        case "manto":
          return <MantoPage key="manto" onBack={handleBack} />;
        case "admin":
          return <AdminPage key="admin" onBack={handleBack} />;
        case "news-detail":
          return (
            <NewsDetailPage
              key={`news-${data?.newsId}`}
              newsId={data?.newsId}
              onBack={data?.from === "home" ? handleBackToHome : handleBackToNews}
              onNavigate={handleNavigate}
            />
          );
        default:
          return null;
      }
    }
    const ActiveComponent = pages[activePage.tab];
    return <ActiveComponent key={activePage.tab} onNavigate={handleNavigate} />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-background flex justify-center">
          <div className="w-full max-w-[430px] bg-background min-h-screen relative">
            <AnimatePresence mode="wait">
              {renderPage()}
            </AnimatePresence>
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
