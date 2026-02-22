import { useState } from "react";
import { Home, Newspaper, Users, BarChart3, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export type TabId = "home" | "news" | "squad" | "stats" | "more";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: "home" as TabId, label: "INÍCIO", icon: Home },
  { id: "news" as TabId, label: "NOTÍCIAS", icon: Newspaper },
  { id: "squad" as TabId, label: "ELENCO", icon: Users },
  { id: "stats" as TabId, label: "STATS", icon: BarChart3 },
  { id: "more" as TabId, label: "MAIS", icon: MoreHorizontal },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gold rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={isActive ? "text-gold" : "text-muted-foreground"}
              />
              <span
                className={`text-[10px] mt-1 font-semibold tracking-wide ${
                  isActive ? "text-gold" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
