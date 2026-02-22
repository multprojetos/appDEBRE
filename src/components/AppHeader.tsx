import { Bell, Sun, Moon } from "lucide-react";
import escudo from "@/assets/escudo-circle.png";
import { useTheme } from "@/hooks/useTheme";

interface AppHeaderProps {
  notificationCount?: number;
}

const AppHeader = ({ notificationCount = 1 }: AppHeaderProps) => {
  const { isDark, toggle } = useTheme();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card safe-top">
      <div className="flex items-center gap-3">
        <img src={escudo} alt="Debreceni FC" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-body font-medium tracking-wide">DEBRECENI FC</span>
          <span className="text-base font-bold text-foreground leading-tight">DEBRE NA REDE</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={toggle} className="p-2 rounded-full hover:bg-muted transition-colors">
          {isDark ? <Sun size={20} className="text-gold" /> : <Moon size={20} className="text-foreground" />}
        </button>
        <button className="relative p-2">
          <Bell size={22} className="text-foreground" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
