import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { products as localProducts } from "@/data/products";

export interface ProductVariant {
  id: string;
  name: string;
  priceUSD: number;
  priceEUR: number;
  image?: string;
  imageAlt?: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: "PEPTIDE BIOREGULATORS" | "ANTI AGING-LONGEVITY" | "NUTRITIONAL SUPPLEMENTS";
  priceUSD: number;
  priceEUR: number;
  rating: number;
  sizes: number;
  image?: string;
  imageAlt?: string;
  benefits?: string[];
  ingredients?: string[];
  usage?: string;
  seriesInfo?: string;
  in_stock?: boolean;
  variants?: ProductVariant[];
}

// ─── Firestore doc → Product ──────────────────────────────────────────────────

function docToProduct(id: string, data: any): Product {
  return {
    id,
    name: data.name,
    description: data.description,
    category: data.category,
    priceUSD: parseFloat(data.priceUSD ?? data.price_usd) || 0,
    priceEUR: parseFloat(data.priceEUR ?? (data.price_eur ?? 0)) || 0,
    rating: parseFloat(data.rating) || 0,
    sizes: data.sizes ?? 1,
    image: data.image ?? undefined,
    imageAlt: data.imageAlt ?? data.image_alt ?? undefined,
    benefits: data.benefits || [],
    ingredients: data.ingredients || [],
    usage: data.usage || undefined,
    seriesInfo: (data.seriesInfo ?? data.series_info) || undefined,
    in_stock: data.in_stock !== false,
    variants: data.variants || [],
  };
}

// ─── fetchProducts ────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured, using local product data");
    return localProducts;
  }

  try {
    const q = query(collection(db, "products"), orderBy("name"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No products in Firestore, using local product data");
      return localProducts;
    }

    return snapshot.docs.map((d) => docToProduct(d.id, d.data()));
  } catch (err) {
    console.error("Error fetching products from Firestore, falling back to local data:", err);
    return localProducts;
  }
}

// ─── fetchProductById ─────────────────────────────────────────────────────────

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!isFirebaseConfigured()) {
    return localProducts.find((p) => p.id === id) || null;
  }

  try {
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) {
      return localProducts.find((p) => p.id === id) || null;
    }
    return docToProduct(snap.id, snap.data());
  } catch (err) {
    console.error("Error fetching product by ID from Firestore:", err);
    return localProducts.find((p) => p.id === id) || null;
  }
}

// ─── fetchProductsByCategory ──────────────────────────────────────────────────

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  if (!isFirebaseConfigured()) {
    return localProducts.filter((p) => p.category === category);
  }

  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      orderBy("name")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return localProducts.filter((p) => p.category === category);
    }

    return snapshot.docs.map((d) => docToProduct(d.id, d.data()));
  } catch (err) {
    console.error("Error fetching products by category from Firestore:", err);
    return localProducts.filter((p) => p.category === category);
  }
}

// ─── createProduct ────────────────────────────────────────────────────────────

export async function createProduct(product: Omit<Product, "id">): Promise<Product | null> {
  try {
    const id = product.name.toLowerCase().replace(/\s+/g, "-");
    const data = {
      name: product.name,
      description: product.description,
      category: product.category,
      priceUSD: product.priceUSD,
      priceEUR: product.priceEUR,
      rating: product.rating,
      image: product.image ?? null,
      imageAlt: product.imageAlt ?? null,
      sizes: product.sizes,
      benefits: product.benefits || [],
      ingredients: product.ingredients || [],
      usage: product.usage ?? null,
      seriesInfo: product.seriesInfo ?? null,
      variants: product.variants || [],
      in_stock: product.in_stock !== false,
    };
    await setDoc(doc(db, "products", id), data);
    return docToProduct(id, data);
  } catch (err) {
    console.error("Error creating product:", err);
    return null;
  }
}

// ─── updateProduct ────────────────────────────────────────────────────────────

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.priceUSD !== undefined) payload.priceUSD = updates.priceUSD;
    if (updates.priceEUR !== undefined) payload.priceEUR = updates.priceEUR;
    if (updates.rating !== undefined) payload.rating = updates.rating;
    if (updates.image !== undefined) payload.image = updates.image;
    if (updates.imageAlt !== undefined) payload.imageAlt = updates.imageAlt;
    if (updates.sizes !== undefined) payload.sizes = updates.sizes;
    if (updates.benefits !== undefined) payload.benefits = updates.benefits;
    if (updates.ingredients !== undefined) payload.ingredients = updates.ingredients;
    if (updates.usage !== undefined) payload.usage = updates.usage;
    if (updates.seriesInfo !== undefined) payload.seriesInfo = updates.seriesInfo;
    if (updates.variants !== undefined) payload.variants = updates.variants;
    if (updates.in_stock !== undefined) payload.in_stock = updates.in_stock;

    await updateDoc(doc(db, "products", id), payload);
    const snap = await getDoc(doc(db, "products", id));
    return snap.exists() ? docToProduct(snap.id, snap.data()) : null;
  } catch (err) {
    console.error("Error updating product:", err);
    return null;
  }
}

// ─── deleteProduct ────────────────────────────────────────────────────────────

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "products", id));
    return true;
  } catch (err) {
    console.error("Error deleting product:", err);
    return false;
  }
}
