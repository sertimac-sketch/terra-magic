import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Leaf, Minus, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
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
        </Routes>
      </AnimatePresence>
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
      <HeroSection />
    </motion.main>
  );
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
        href="#carrito"
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
            <button type="button">Continuar compra</button>
            <button className="ghost-button" onClick={clearCart} type="button">
              Vaciar carrito
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
