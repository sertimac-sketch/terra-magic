export type ProductType = "plant" | "supply";

export type ProductCategory =
  | "Interior"
  | "Exterior"
  | "Cactus"
  | "Suculentas"
  | "Fertilizantes"
  | "Maceteros"
  | "Sustratos"
  | "Accesorios";

export interface BaseProduct {
  id: string;
  name: string;
  type: ProductType;
  categories: ProductCategory[];
  description: string;
  price: number;
  stock: number;
  image: string;
}

export interface PlantProduct extends BaseProduct {
  type: "plant";
  care: string;
  careLevel: "Bajo" | "Medio";
  light: "Luz indirecta" | "Media sombra" | "Sol parcial";
}

export interface SupplyProduct extends BaseProduct {
  type: "supply";
  usage: string;
  presentation: string;
}

export type Product = PlantProduct | SupplyProduct;
