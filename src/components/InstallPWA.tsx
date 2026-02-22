import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import escudo from '@/assets/escudo-circle.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user already dismissed the banner
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show banner if not installed, not dismissed recently (7 days)
    if (!isInStandaloneMode && daysSinceDismissed > 7) {
      if (iOS) {
        // Show iOS instructions after a delay
        setTimeout(() => setShowBanner(true), 3000);
      } else {
        // Listen for beforeinstallprompt event (Android/Chrome)
        const handler = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
      }
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowBanner(false);
  };

  if (isStandalone || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-50 max-w-[430px] mx-auto"
      >
        <div className="bg-gradient-to-br from-[#1e3a5f] via-[#2c5282] to-[#1a365d] rounded-2xl shadow-2xl border border-gold/20 overflow-hidden">
          <div className="p-4">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={18} className="text-white/70" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0">
                <img src={escudo} alt="Debreceni FC" className="w-14 h-14 object-contain" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg text-white font-bold">
                  Debreceni App
                </h3>
                <p className="text-sm text-white/80 mt-0.5">
                  {isIOS
                    ? 'Adicione à tela inicial'
                    : 'Instale o app para acesso rápido'}
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="mt-4 p-3 bg-white/10 rounded-xl">
                <p className="text-xs text-white/90 leading-relaxed">
                  1. Toque no ícone <span className="font-bold">Compartilhar</span> 
                  <span className="inline-block mx-1">
                    <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                    </svg>
                  </span>
                  <br />
                  2. Role e toque em <span className="font-bold">"Adicionar à Tela de Início"</span>
                </p>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="mt-4 w-full py-3 bg-gold hover:bg-gold/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <Download size={20} />
                Instalar App
              </button>
            )}
          </div>

          <div className="h-1 bg-gradient-to-r from-gold via-yellow-400 to-gold"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
