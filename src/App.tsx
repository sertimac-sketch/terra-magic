import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Instagram,
  Leaf,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { categories, fetchProducts } from "./data/products";
import { useCartStore } from "./store/cartStore";
import type { Product, ProductCategory, ProductType } from "./types/product";
import { formatCurrency } from "./utils/format";
import logo from "../assets/logo.png";

type CategoryFilter = "Todas" | ProductCategory;
type TypeFilter = "Todos" | ProductType;

const productTypeLabels: Record<TypeFilter, string> = {
  Todos: "Todos",
  plant: "Plantas",
  supply: "Insumos",
};

const getProductPath = (product: Product) => `/productos/${product.id}`;

export function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Header />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomeView />} />
          <Route path="/catalogo" element={<CatalogView />} />
          <Route path="/productos/:productId" element={<ProductDetailView />} />
          <Route path="/checkout" element={<CheckoutView />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

function HomeView() {
  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="home-main"
      exit={{ opacity: 0, y: -4 }}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.72, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <SeedGrowthBackground />
      <HeroSection />
    </motion.main>
  );
}

function SeedGrowthBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let start = performance.now();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
    const easeInOut = (value: number) =>
      value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
    const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

    const drawPot = (progress: number) => {
      const potTop = height * 0.68;
      const potBottom = height * 0.9;
      const potWidth = Math.min(width * 0.72, 320);
      const potTopWidth = potWidth;
      const potBottomWidth = potWidth * 0.72;
      const centerX = width / 2;
      const reveal = easeOutCubic(progress);

      context.save();
      context.globalAlpha = 0.86 * reveal;

      context.fillStyle = "#a87548";
      context.beginPath();
      context.roundRect(centerX - potTopWidth / 2, potTop - 14, potTopWidth, 28, 14);
      context.fill();

      context.fillStyle = "#c58a56";
      context.beginPath();
      context.moveTo(centerX - potTopWidth * 0.43, potTop);
      context.lineTo(centerX + potTopWidth * 0.43, potTop);
      context.lineTo(centerX + potBottomWidth * 0.5, potBottom);
      context.quadraticCurveTo(centerX, potBottom + 18, centerX - potBottomWidth * 0.5, potBottom);
      context.closePath();
      context.fill();

      context.globalAlpha = 0.22 * reveal;
      context.fillStyle = "#5a442a";
      context.beginPath();
      context.ellipse(centerX, potTop + 2, potTopWidth * 0.4, 16, 0, 0, Math.PI * 2);
      context.fill();

      context.globalAlpha = 0.35 * reveal;
      context.strokeStyle = "#8f6b3f";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(centerX - potTopWidth * 0.33, potTop + 44);
      context.lineTo(centerX + potTopWidth * 0.33, potTop + 44);
      context.stroke();
      context.restore();
    };

    const drawRoots = (progress: number, breath: number) => {
      if (progress <= 0) {
        return;
      }

      const rootProgress = easeOutCubic(progress);
      const potTop = height * 0.68;
      const centerX = width / 2;
      const rootStartY = potTop + 2;
      const rootLength = Math.min(height * 0.16, 130) * rootProgress;
      const roots = [
        { x: -6, bend: -34, end: -58 },
        { x: 0, bend: 8, end: 4 },
        { x: 7, bend: 38, end: 62 },
        { x: -2, bend: -18, end: -28 },
        { x: 4, bend: 24, end: 34 },
      ];

      context.save();
      context.globalAlpha = 0.62;
      context.strokeStyle = "#f1d4a6";
      context.lineWidth = 2.1;
      context.lineCap = "round";

      roots.forEach((root, index) => {
        const sway = Math.sin(breath + index) * 1.8;
        context.beginPath();
        context.moveTo(centerX + root.x, rootStartY);
        context.bezierCurveTo(
          centerX + root.bend * 0.35 + sway,
          rootStartY + rootLength * 0.32,
          centerX + root.bend + sway,
          rootStartY + rootLength * 0.7,
          centerX + root.end,
          rootStartY + rootLength,
        );
        context.stroke();
      });

      context.restore();
    };

    const drawVinePlant = (progress: number, breath: number) => {
      if (progress <= 0) {
        return;
      }

      const potTop = height * 0.68;
      const centerX = width / 2;
      const stemHeight = Math.min(height * 0.44, 330) * easeOutCubic(progress);
      const stemTop = potTop - stemHeight;

      context.save();
      context.lineCap = "round";
      context.strokeStyle = "#738349";
      context.lineWidth = 4.2;
      context.beginPath();
      context.moveTo(centerX, potTop - 6);
      context.bezierCurveTo(
        centerX - 42,
        potTop - stemHeight * 0.25,
        centerX + 48,
        potTop - stemHeight * 0.62,
        centerX - 6,
        stemTop,
      );
      context.stroke();

      context.strokeStyle = "#8fa46d";
      context.lineWidth = 2.1;
      const curlProgress = easeOutCubic(clamp((progress - 0.48) / 0.52));
      context.beginPath();
      context.arc(centerX + 30, stemTop + 22, 18 * curlProgress, -0.4, Math.PI * 1.7);
      context.stroke();

      const leafProgress = clamp((progress - 0.32) / 0.68);
      const leafLift = Math.sin(breath) * 2;
      context.fillStyle = "#8fa46d";
      context.strokeStyle = "#4f5c37";
      context.lineWidth = 1.4;

      const leaves = [
        { x: -22, y: -stemHeight * 0.22, rotate: -0.72, side: -1, scale: 0.75 },
        { x: 24, y: -stemHeight * 0.38, rotate: 0.68, side: 1, scale: 0.82 },
        { x: -18, y: -stemHeight * 0.55, rotate: -0.58, side: -1, scale: 0.88 },
        { x: 16, y: -stemHeight * 0.72, rotate: 0.55, side: 1, scale: 0.95 },
        { x: -4, y: -stemHeight * 0.9, rotate: -0.15, side: -1, scale: 0.82 },
      ];

      leaves.forEach((leaf, index) => {
        const localProgress = easeOutCubic(clamp((leafProgress - index * 0.1) / 0.65));
        if (localProgress <= 0) {
          return;
        }

        context.save();
        context.translate(centerX + leaf.x, potTop + leaf.y + leafLift);
        context.rotate(leaf.rotate);
        context.scale(localProgress * leaf.scale, localProgress * leaf.scale);
        context.beginPath();
        context.ellipse(leaf.side * 18, 0, 22, 10, 0, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.restore();
      });

      context.restore();
    };

    const drawSeed = (progress: number) => {
      if (progress >= 0.86) {
        return;
      }

      const fallProgress = easeInOut(clamp(progress / 0.55));
      const buryProgress = easeOutCubic(clamp((progress - 0.55) / 0.31));
      const startY = height * 0.16;
      const potTop = height * 0.68;
      const seedY = startY + (potTop - startY - 12) * fallProgress + buryProgress * 18;
      const seedX = width / 2 + Math.sin(progress * Math.PI * 3) * 14;

      context.save();
      context.translate(seedX, seedY);
      context.rotate(progress * 4.5);
      context.globalAlpha = 1 - buryProgress * 0.7;
      context.fillStyle = "#a87548";
      context.strokeStyle = "#5a442a";
      context.lineWidth = 1.3;
      context.beginPath();
      context.ellipse(0, 0, 10, 15, 0.35, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.restore();
    };

    const drawAmbient = (time: number) => {
      context.save();
      context.globalAlpha = 0.32;
      context.fillStyle = "#8fa46d";
      for (let index = 0; index < 16; index += 1) {
        const drift = (time * 0.012 + index * 37) % (width + 80);
        const x = drift - 40;
        const y = height * 0.18 + ((index * 61) % Math.max(height * 0.48, 1));
        context.beginPath();
        context.arc(x, y, 1.1 + (index % 3) * 0.35, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    };

    const draw = (now: number) => {
      const elapsed = reduceMotion ? 6200 : (now - start) % 7800;
      const progress = clamp(elapsed / 5200);
      const breath = now / 900;

      context.clearRect(0, 0, width, height);
      drawAmbient(now);
      drawPot(clamp(progress / 0.22));
      drawSeed(progress);
      drawRoots(clamp((progress - 0.58) / 0.28), breath);
      drawVinePlant(clamp((progress - 0.62) / 0.38), breath);

      if (!reduceMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw(performance.now());

    if (!reduceMotion) {
      start = performance.now();
      animationFrame = window.requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas className="seed-growth-background" ref={canvasRef} aria-hidden="true" />;
}

function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="hero-copy"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.9, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.span
          animate={{ opacity: 1, y: 0 }}
          className="eyebrow"
          initial={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Leaf size={16} />
          Plantas, sustratos y accesorios
        </motion.span>
        <h1 id="hero-title">Terra Magic</h1>
        <p>
          Una seleccion cuidada para crear espacios verdes con plantas sanas,
          insumos simples y una compra clara desde el primer paso.
        </p>
      </motion.div>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="hero-panel"
        initial={{ opacity: 0, scale: 0.985 }}
        transition={{ duration: 1, delay: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <img src={logo} alt="Terra Magic" />
      </motion.div>
    </section>
  );
}

function CatalogView() {
  const [selectedType, setSelectedType] = useState<TypeFilter>("Todos");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesType = selectedType === "Todos" || product.type === selectedType;
      const matchesCategory =
        selectedCategory === "Todas" || product.categories.includes(selectedCategory);
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch);

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory, selectedType]);

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="catalog-main"
      exit={{ opacity: 0, y: 12 }}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="store-layout" id="catalogo" aria-label="Catalogo de productos">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="catalog"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="catalog-toolbar">
            <div>
              <span className="section-kicker">Catalogo</span>
              <h2>Productos disponibles</h2>
            </div>

            <label className="search-box">
              <Search size={18} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar plantas o insumos"
              />
            </label>
          </div>

          <div className="type-list" aria-label="Tipo de producto">
            {(Object.keys(productTypeLabels) as TypeFilter[]).map((type) => (
              <button
                className={type === selectedType ? "type-button active" : "type-button"}
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setSelectedCategory("Todas");
                }}
                type="button"
              >
                {productTypeLabels[type]}
              </button>
            ))}
          </div>

          <div className="category-list" aria-label="Categorias">
            {categories.map((category) => (
              <button
                className={category === selectedCategory ? "category-button active" : "category-button"}
                key={category}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="empty-state">Cargando productos...</div>
          ) : (
            <motion.div
              animate="show"
              className="product-grid"
              initial="hidden"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </motion.div>

        <CartPanel />
      </section>
    </motion.main>
  );
}

function Header() {
  const totalQuantity = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Ir al inicio">
        <img src={logo} alt="" />
        <span>Terra Magic</span>
      </Link>

      <nav aria-label="Navegacion principal">
        <Link to="/">Inicio</Link>
        <Link to="/catalogo">Catalogo</Link>
      </nav>

      <motion.a
        animate={{ scale: totalQuantity > 0 ? [1, 1.08, 1] : 1 }}
        className="cart-link"
        href="/catalogo#carrito"
        aria-label={`Ver carrito con ${totalQuantity} productos`}
        transition={{ duration: 0.28 }}
      >
        <ShoppingBag size={19} />
        <span>{totalQuantity}</span>
      </motion.a>
    </header>
  );
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const currentQuantity = useCartStore(
    (state) => state.items.find((item) => item.product.id === product.id)?.quantity ?? 0,
  );
  const isOutOfStock = product.stock === 0;
  const reachedStock = currentQuantity >= product.stock;

  return (
    <motion.article
      className="product-card"
      id={product.id}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
      }}
      whileHover={{ y: -4 }}
    >
      <Link className="product-image" to={getProductPath(product)} aria-label={`Ver detalle de ${product.name}`}>
        <img src={product.image} alt={product.name} />
        <span>{product.categories[0]}</span>
      </Link>
      <div className="product-info">
        <div>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>

        <div className="product-meta">
          <span>{product.categories.join(" / ")}</span>
          <span>{product.type === "plant" ? product.light : product.presentation}</span>
        </div>

        <div className="product-footer">
          <div>
            <strong>{formatCurrency(product.price)}</strong>
            <small>{product.stock} en stock</small>
          </div>
          <div className="card-actions">
            <Link to={getProductPath(product)}>Ver detalle</Link>
            <motion.button
              disabled={isOutOfStock || reachedStock}
              onClick={() => addItem(product)}
              type="button"
              whileTap={{ scale: 0.96 }}
            >
              <Plus size={18} />
              Agregar
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ProductDetailView() {
  const { productId } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const currentQuantity = useCartStore(
    (state) => state.items.find((item) => item.product.id === productId)?.quantity ?? 0,
  );
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const product = products.find((item) => item.id === productId);

  if (isLoading) {
    return (
      <motion.main
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="empty-state">Cargando producto...</div>
      </motion.main>
    );
  }

  if (!product) {
    return <Navigate to="/" replace />;
  }

  const reachedStock = currentQuantity >= product.stock;

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link className="back-link" to="/catalogo">
        <ArrowLeft size={18} />
        Volver al catalogo
      </Link>

      <section className="detail-layout" aria-labelledby="product-title">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="detail-media"
          initial={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <img src={product.image} alt={product.name} />
        </motion.div>

        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="detail-content"
          initial={{ opacity: 0, x: 18 }}
          transition={{ duration: 0.45, delay: 0.16 }}
        >
          <div>
            <span className="section-kicker">{product.categories.join(" / ")}</span>
            <h1 id="product-title">{product.name}</h1>
            <p>{product.description}</p>
          </div>

          <div className="detail-care">
            <h2>{product.type === "plant" ? "Cuidados" : "Uso recomendado"}</h2>
            <p>{product.type === "plant" ? product.care : product.usage}</p>
            <div className="care-grid">
              {product.type === "plant" ? (
                <>
                  <span>Luz: {product.light}</span>
                  <span>Cuidado: {product.careLevel}</span>
                </>
              ) : (
                <>
                  <span>Presentacion: {product.presentation}</span>
                  <span>Tipo: Insumo</span>
                </>
              )}
              <span>Stock: {product.stock}</span>
            </div>
          </div>

          <div className="detail-purchase">
            <strong>{formatCurrency(product.price)}</strong>
            <motion.button
              disabled={product.stock === 0 || reachedStock}
              onClick={() => addItem(product)}
              type="button"
              whileTap={{ scale: 0.96 }}
            >
              <Plus size={18} />
              Agregar al carrito
            </motion.button>
          </div>
        </motion.div>
      </section>
    </motion.main>
  );
}

function CheckoutView() {
  const { items, clearCart } = useCartStore();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [formError, setFormError] = useState("");
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const storePhone = import.meta.env.VITE_STORE_WHATSAPP_PHONE?.replace(/\D/g, "") ?? "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (items.length === 0) {
      setFormError("Tu carrito esta vacio.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setFormError("Nombre y telefono son obligatorios.");
      return;
    }

    if (needsDelivery && !deliveryAddress.trim()) {
      setFormError("Ingresa la direccion para coordinar delivery.");
      return;
    }

    const productLines = items
      .map(
        (item) =>
          `- ${item.product.name} x${item.quantity}: ${formatCurrency(item.product.price * item.quantity)}`,
      )
      .join("\n");

    const message = [
      "Hola, quiero hacer un pedido en Terra Magic:",
      "",
      productLines,
      "",
      `Total: ${formatCurrency(subtotal)}`,
      "",
      `Nombre: ${customerName.trim()}`,
      `Telefono: ${customerPhone.trim()}`,
      `Delivery: ${needsDelivery ? "Si" : "No"}`,
      needsDelivery ? `Direccion: ${deliveryAddress.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl = storePhone
      ? `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setFormError("");
  };

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="checkout-main"
      exit={{ opacity: 0, y: 12 }}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link className="back-link" to="/catalogo">
        <ArrowLeft size={18} />
        Volver al catalogo
      </Link>

      <section className="checkout-layout" aria-labelledby="checkout-title">
        <div className="checkout-form-panel">
          <span className="section-kicker">Checkout</span>
          <h1 id="checkout-title">Datos para coordinar tu compra</h1>
          <p>
            Completa tus datos para generar el mensaje de WhatsApp con el detalle del pedido.
          </p>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <label>
              Nombre del cliente
              <input
                required
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Ej: Maria Gonzalez"
              />
            </label>

            <label>
              Telefono de contacto
              <input
                required
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Ej: +56 9 1234 5678"
                type="tel"
              />
            </label>

            <label className="delivery-toggle">
              <input
                checked={needsDelivery}
                onChange={(event) => setNeedsDelivery(event.target.checked)}
                type="checkbox"
              />
              Necesito delivery
            </label>

            {needsDelivery ? (
              <label>
                Direccion de entrega
                <textarea
                  required
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Calle, numero, comuna y referencias"
                  rows={4}
                />
              </label>
            ) : null}

            {formError ? <p className="form-error">{formError}</p> : null}

            <motion.button disabled={items.length === 0} type="submit" whileTap={{ scale: 0.98 }}>
              <MessageCircle size={18} />
              Enviar pedido por WhatsApp
            </motion.button>
          </form>
        </div>

        <aside className="checkout-summary" aria-label="Resumen del pedido">
          <div>
            <span className="section-kicker">Resumen</span>
            <h2>Detalle del pedido</h2>
          </div>

          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Tu carrito esta vacio.</p>
              <span>Vuelve al catalogo para agregar productos.</span>
            </div>
          ) : (
            <>
              <div className="checkout-items">
                {items.map((item) => (
                  <div className="checkout-item" key={item.product.id}>
                    <img src={item.product.image} alt="" />
                    <div>
                      <strong>{item.product.name}</strong>
                      <span>
                        {item.quantity} x {formatCurrency(item.product.price)}
                      </span>
                    </div>
                    <b>{formatCurrency(item.product.price * item.quantity)}</b>
                  </div>
                ))}
              </div>

              <div className="checkout-total">
                <span>Total</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <button className="ghost-button summary-clear" onClick={clearCart} type="button">
                Vaciar carrito
              </button>
            </>
          )}
        </aside>
      </section>
    </motion.main>
  );
}

function CartPanel() {
  const { items, addItem, decrementItem, removeItem, clearCart } = useCartStore();
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <aside className="cart-panel" id="carrito" aria-label="Carrito de compras">
      <div className="cart-header">
        <div>
          <span className="section-kicker">Carrito</span>
          <h2>Tu compra</h2>
        </div>
        <ShoppingBag size={22} />
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>El carrito esta vacio.</p>
          <span>Agrega plantas o insumos para preparar tu pedido.</span>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.product.id}>
                <img src={item.product.image} alt="" />
                <div>
                  <strong>{item.product.name}</strong>
                  <span>{formatCurrency(item.product.price)}</span>
                  <div className="quantity-controls">
                    <button onClick={() => decrementItem(item.product.id)} type="button" aria-label="Restar">
                      <Minus size={15} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      disabled={item.quantity >= item.product.stock}
                      onClick={() => addItem(item.product)}
                      type="button"
                      aria-label="Sumar"
                    >
                      <Plus size={15} />
                    </button>
                    <button onClick={() => removeItem(item.product.id)} type="button" aria-label="Eliminar">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <Link className="checkout-link" to="/checkout">
              Continuar compra
            </Link>
            <button className="ghost-button" onClick={clearCart} type="button">
              Vaciar carrito
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Terra Magic. Derechos reservados.</span>
      <a
        href="https://www.instagram.com/terra_magic_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
        rel="noreferrer"
        target="_blank"
        aria-label="Instagram de Terra Magic"
      >
        <Instagram size={17} />
        Instagram
      </a>
      <span>
        Desarrollado por{" "}
        <a href="https://www.marcode.cl" rel="noreferrer" target="_blank">
          MarCode
        </a>
      </span>
    </footer>
  );
}
