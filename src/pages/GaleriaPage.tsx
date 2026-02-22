import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";

interface GaleriaPageProps {
  onBack: () => void;
}

interface GalleryAlbum {
  id: string;
  title: string;
  date: string;
  photos: string[];
}

const mockAlbums: GalleryAlbum[] = [
  {
    id: "1",
    title: "Debrê 4x1 Pedreira FC",
    date: "20 Fev 2026",
    photos: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=300&fit=crop",
    ],
  },
  {
    id: "2",
    title: "Treino da Semana",
    date: "18 Fev 2026",
    photos: [
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1600679472829-3044539ce8ed?w=400&h=300&fit=crop",
    ],
  },
  {
    id: "3",
    title: "Debrê 3x0 São José EC",
    date: "13 Fev 2026",
    photos: [
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=300&fit=crop",
    ],
  },
];

const GaleriaPage = ({ onBack }: GaleriaPageProps) => {
  const [lightbox, setLightbox] = useState<{ albumIdx: number; photoIdx: number } | null>(null);

  const currentAlbum = lightbox !== null ? mockAlbums[lightbox.albumIdx] : null;

  const navigate = (dir: -1 | 1) => {
    if (!lightbox || !currentAlbum) return;
    const next = lightbox.photoIdx + dir;
    if (next >= 0 && next < currentAlbum.photos.length) {
      setLightbox({ ...lightbox, photoIdx: next });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
      className="min-h-screen pb-20 bg-background"
    >
      <div className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="p-1 -ml-1">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <ImageIcon size={20} className="text-accent" />
            <h1 className="font-display text-lg text-foreground">GALERIA DE FOTOS</h1>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-5">
        {mockAlbums.map((album, aIdx) => (
          <div key={album.id}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground">{album.title}</h3>
              <span className="text-[10px] text-muted-foreground">{album.date}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
              {album.photos.map((photo, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => setLightbox({ albumIdx: aIdx, photoIdx: pIdx })}
                  className="aspect-square overflow-hidden relative group"
                >
                  <img
                    src={photo}
                    alt={`${album.title} foto ${pIdx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && currentAlbum && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
          >
            <div className="absolute top-4 right-4 safe-top z-10">
              <button onClick={() => setLightbox(null)} className="p-2">
                <X size={24} className="text-white" />
              </button>
            </div>

            <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-xs safe-top">
              {lightbox.photoIdx + 1} / {currentAlbum.photos.length}
            </p>

            <img
              src={currentAlbum.photos[lightbox.photoIdx]}
              alt=""
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />

            {lightbox.photoIdx > 0 && (
              <button onClick={() => navigate(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2">
                <ChevronLeft size={28} className="text-white/70" />
              </button>
            )}
            {lightbox.photoIdx < currentAlbum.photos.length - 1 && (
              <button onClick={() => navigate(1)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2">
                <ChevronRight size={28} className="text-white/70" />
              </button>
            )}

            <p className="mt-4 text-white/80 text-sm font-semibold">{currentAlbum.title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GaleriaPage;
