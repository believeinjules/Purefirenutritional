import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Upload,
  Loader2,
  ImageOff,
} from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { fetchProducts, Product } from "@/lib/productsStorage";
import { db, storage } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setDoc, updateDoc } from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
  | "PEPTIDE BIOREGULATORS"
  | "ANTI AGING-LONGEVITY"
  | "NUTRITIONAL SUPPLEMENTS";

interface ProductFormData {
  id: string;
  name: string;
  category: Category;
  description: string;
  priceUSD: number;
  priceEUR: number;
  rating: number;
  image: string;
  imageAlt: string;
  benefitsText: string; // one per line → array on save
  ingredientsText: string; // one per line → array on save
  usage: string;
  seriesInfo: string;
  in_stock: boolean;
}

const CATEGORIES: Category[] = [
  "PEPTIDE BIOREGULATORS",
  "ANTI AGING-LONGEVITY",
  "NUTRITIONAL SUPPLEMENTS",
];

const CATEGORY_COLORS: Record<Category, string> = {
  "PEPTIDE BIOREGULATORS": "bg-blue-100 text-blue-800",
  "ANTI AGING-LONGEVITY": "bg-purple-100 text-purple-800",
  "NUTRITIONAL SUPPLEMENTS": "bg-green-100 text-green-800",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function emptyForm(): ProductFormData {
  return {
    id: "",
    name: "",
    category: "PEPTIDE BIOREGULATORS",
    description: "",
    priceUSD: 0,
    priceEUR: 0,
    rating: 4.8,
    image: "",
    imageAlt: "",
    benefitsText: "",
    ingredientsText: "",
    usage: "",
    seriesInfo: "",
    in_stock: true,
  };
}

function productToForm(p: Product): ProductFormData {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    priceUSD: p.priceUSD,
    priceEUR: p.priceEUR,
    rating: p.rating,
    image: p.image ?? "",
    imageAlt: p.imageAlt ?? "",
    benefitsText: (p.benefits ?? []).join("\n"),
    ingredientsText: (p.ingredients ?? []).join("\n"),
    usage: p.usage ?? "",
    seriesInfo: p.seriesInfo ?? "",
    in_stock: (p as any).in_stock !== false, // default true
  };
}

function formToRow(form: ProductFormData) {
  return {
    id: form.id,
    name: form.name,
    category: form.category,
    description: form.description,
    price_usd: form.priceUSD,
    price_eur: form.priceEUR,
    rating: form.rating,
    image: form.image || null,
    image_alt: form.imageAlt || null,
    benefits: form.benefitsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    ingredients: form.ingredientsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    usage: form.usage || null,
    series_info: form.seriesInfo || null,
    in_stock: form.in_stock,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductManager() {
  const [, setLocation] = useLocation();

  // List state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Sheet / form state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProductFormData>(emptyForm());
  const [saving, setSaving] = useState(false);

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // ── Filter ────────────────────────────────────────────────────────────────

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    const matchCat =
      activeCategory === "all" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  // ── Open sheet ────────────────────────────────────────────────────────────

  function openAdd() {
    setForm(emptyForm());
    setIsEditing(false);
    setSheetOpen(true);
  }

  function openEdit(product: Product) {
    setForm(productToForm(product));
    setIsEditing(true);
    setSheetOpen(true);
  }

  // ── Auto-generate id from name (add mode only) ────────────────────────────

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      id: isEditing ? prev.id : slugify(name),
    }));
  }

  // ── Image upload ──────────────────────────────────────────────────────────

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const storageRef = ref(storage, `products/${filename}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setForm((prev) => ({ ...prev, image: downloadURL }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(`Upload failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.id.trim()) {
      toast.error("Product ID is required");
      return;
    }

    setSaving(true);
    try {
      const row = formToRow(form);
      const docRef = doc(db, "products", row.id);
      if (isEditing) {
        await updateDoc(docRef, row);
      } else {
        await setDoc(docRef, row);
      }

      toast.success(isEditing ? "Product updated" : "Product created");
      setSheetOpen(false);
      await loadProducts();
    } catch (err: any) {
      toast.error(`Save failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "products", deleteTarget));
      toast.success("Product deleted");
      setDeleteTarget(null);
      await loadProducts();
    } catch (err: any) {
      toast.error(`Delete failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">

          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="mb-2 -ml-2"
                onClick={() => setLocation("/admin")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Admin
              </Button>
              <h1 className="text-3xl font-bold">Product Manager</h1>
              <p className="text-gray-500 text-sm mt-1">
                {products.length} product{products.length !== 1 ? "s" : ""} in catalog
              </p>
            </div>
            <Button
              onClick={openAdd}
              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Search + category filter */}
          <Card className="mb-6">
            <CardContent className="pt-5 pb-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or description…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Tabs
                  value={activeCategory}
                  onValueChange={setActiveCategory}
                  className="w-full md:w-auto"
                >
                  <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="all">All</TabsTrigger>
                    {CATEGORIES.map((cat) => (
                      <TabsTrigger key={cat} value={cat} className="text-xs">
                        {cat}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Product table */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading products…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              {searchQuery || activeCategory !== "all"
                ? "No products match your filters."
                : "No products yet — click Add Product to get started."}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price USD</TableHead>
                    <TableHead>Price EUR</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.imageAlt ?? product.name}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md border bg-gray-100 flex items-center justify-center">
                            <ImageOff className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-400">{product.id}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${CATEGORY_COLORS[product.category]}`}
                          variant="outline"
                        >
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>${product.priceUSD.toFixed(2)}</TableCell>
                      <TableCell>€{product.priceEUR.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className="text-yellow-500">★</span>{" "}
                        {product.rating.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={(product as any).in_stock !== false ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {(product as any).in_stock !== false ? "In Stock" : "Out"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(product.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </main>

      <Footer />

      {/* ── Add / Edit Sheet ─────────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle>
              {isEditing ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the product details below."
                : "Fill in the product information. ID is auto-generated from the name."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 pb-8">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="pm-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pm-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Bonomarlot"
              />
            </div>

            {/* ID */}
            <div className="space-y-1.5">
              <Label htmlFor="pm-id">
                ID (slug) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pm-id"
                value={form.id}
                readOnly={isEditing}
                onChange={(e) =>
                  !isEditing && setForm((p) => ({ ...p, id: e.target.value }))
                }
                className={isEditing ? "bg-gray-50 text-gray-500" : ""}
                placeholder="auto-generated-from-name"
              />
              {isEditing && (
                <p className="text-xs text-gray-400">ID cannot be changed after creation.</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, category: v as Category }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="pm-desc">Description</Label>
              <Textarea
                id="pm-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={4}
                placeholder="Full product description…"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pm-usd">Price USD</Label>
                <Input
                  id="pm-usd"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.priceUSD}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      priceUSD: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pm-eur">Price EUR</Label>
                <Input
                  id="pm-eur"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.priceEUR}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      priceEUR: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <Label htmlFor="pm-rating">Rating (0–5)</Label>
              <Input
                id="pm-rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    rating: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            {/* Image */}
            <div className="space-y-1.5">
              <Label htmlFor="pm-image">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="pm-image"
                  value={form.image}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, image: e.target.value }))
                  }
                  placeholder="https://… or /products/image.png"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span className="ml-1 hidden sm:inline">Upload</span>
                </Button>
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="preview"
                  className="mt-2 h-24 w-24 object-cover rounded-md border"
                />
              )}
            </div>

            {/* Image Alt */}
            <div className="space-y-1.5">
              <Label htmlFor="pm-alt">Image Alt Text</Label>
              <Input
                id="pm-alt"
                value={form.imageAlt}
                onChange={(e) =>
                  setForm((p) => ({ ...p, imageAlt: e.target.value }))
                }
                placeholder="Descriptive alt text for accessibility"
              />
            </div>

            {/* Benefits */}
            <div className="space-y-1.5">
              <Label htmlFor="pm-benefits">Benefits (one per line)</Label>
              <Textarea
                id="pm-benefits"
                value={form.benefitsText}
                onChange={(e) =>
                  setForm((p) => ({ ...p, benefitsText: e.target.value }))
                }
                rows={4}
                placeholder={"Supports immune function\nPromotes longevity\nAnti-inflammatory"}
              />
            </div>

            {/* Ingredients */}
            <div className="space-y-1.5">
              <Label htmlFor="pm-ingredients">Ingredients (one per line)</Label>
              <Textarea
                id="pm-ingredients"
                value={form.ingredientsText}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ingredientsText: e.target.value }))
                }
                rows={4}
                placeholder={"Peptide complex\nVitamin C\nZinc"}
              />
            </div>

            {/* Usage */}
            <div className="space-y-1.5">
              <Label htmlFor="pm-usage">Usage Instructions</Label>
              <Textarea
                id="pm-usage"
                value={form.usage}
                onChange={(e) =>
                  setForm((p) => ({ ...p, usage: e.target.value }))
                }
                rows={3}
                placeholder="Take 1 capsule daily with food…"
              />
            </div>

            {/* Series Info */}
            <div className="space-y-1.5">
              <Label htmlFor="pm-series">Series Info</Label>
              <Textarea
                id="pm-series"
                value={form.seriesInfo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, seriesInfo: e.target.value }))
                }
                rows={3}
                placeholder="Part of the Cytomaxes series…"
              />
            </div>

            {/* In Stock */}
            <div className="flex items-center gap-3">
              <Switch
                id="pm-stock"
                checked={form.in_stock}
                onCheckedChange={(checked) =>
                  setForm((p) => ({ ...p, in_stock: checked }))
                }
              />
              <Label htmlFor="pm-stock" className="cursor-pointer">
                In Stock
              </Label>
            </div>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : isEditing ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation ───────────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the product from your catalog. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
