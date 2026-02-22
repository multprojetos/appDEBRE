import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shirt, ShoppingCart, Star } from "lucide-react";
import escudo from "@/assets/escudo-circle.png";

interface MantoPageProps {
  onBack: () => void;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes: string[];
  badge?: string;
  rating: number;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Manto Principal 2026",
    description: "Camisa oficial azul marinho com detalhes dourados. Tecido dry-fit premium.",
    price: 149.90,
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=400&fit=crop",
    sizes: ["P", "M", "G", "GG"],
    badge: "NOVO",
    rating: 5,
  },
  {
    id: "2",
    name: "Manto Reserva 2026",
    description: "Camisa reserva branca com escudo bordado e faixas douradas.",
    price: 139.90,
    image: "https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?w=400&h=400&fit=crop",
    sizes: ["P", "M", "G", "GG", "XGG"],
    rating: 4,
  },
  {
    id: "3",
    name: "Manto Goleiro 2026",
    description: "Camisa exclusiva do goleiro em verde com detalhes pretos.",
    price: 139.90,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=400&fit=crop",
    sizes: ["M", "G", "GG"],
    rating: 4,
  },
  {
    id: "4",
    name: "Camisa Treino 2026",
    description: "Camisa de treino leve e confortável. Ideal para o dia a dia do torcedor.",
    price: 89.90,
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=400&fit=crop",
    sizes: ["P", "M", "G", "GG"],
    rating: 4,
  },
  {
    id: "5",
    name: "Manto Retrô Edição Especial",
    description: "Edição limitada comemorativa com design clássico do primeiro uniforme do Debrê.",
    price: 179.90,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop",
    sizes: ["M", "G"],
    badge: "LIMITADO",
    rating: 5,
  },
];

const MantoPage = ({ onBack }: MantoPageProps) => {
  const [selectedSize, setSelectedSize] = useState<Record<string, string>>({});

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
            <Shirt size={20} className="text-accent" />
            <h1 className="font-display text-lg text-foreground">MANTO SAGRADO</h1>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="px-4 mt-4">
        <div className="bg-primary rounded-xl p-4 flex items-center gap-3">
          <img src={escudo} alt="Debreceni FC" className="w-12 h-12 rounded-full object-cover" />
          <div>
            <p className="text-primary-foreground font-bold text-sm">Vista o manto do Debrê!</p>
            <p className="text-primary-foreground/60 text-xs">Uniformes oficiais temporada 2026</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-4 mt-4 space-y-3">
        {mockProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border/50 overflow-hidden"
          >
            <div className="flex gap-3 p-3">
              {/* Image */}
              <div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {product.badge && (
                  <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${
                    product.badge === "NOVO" ? "bg-green-600" : "bg-destructive"
                  }`}>
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="text-sm font-bold text-foreground leading-tight">{product.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={i < product.rating ? "text-accent fill-accent" : "text-muted-foreground/30"}
                    />
                  ))}
                </div>

                <div className="mt-auto pt-1">
                  <span className="text-lg font-bold text-accent">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            {/* Sizes + Buy */}
            <div className="px-3 pb-3 flex items-center gap-2">
              <div className="flex gap-1 flex-1 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize((prev) => ({ ...prev, [product.id]: size }))}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      selectedSize[product.id] === size
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-bold active:scale-95 transition-transform"
              >
                <ShoppingCart size={14} />
                Comprar
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-[10px] text-muted-foreground mt-4 px-4 pb-4">
        Entrega via combinação direta · Pagamento via Pix ou presencial
      </p>
    </motion.div>
  );
};

export default MantoPage;
