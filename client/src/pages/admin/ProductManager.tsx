import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { fetchProducts, createProduct, updateProduct, deleteProduct, Product } from "@/lib/productsStorage";

interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  category: "PEPTIDE BIOREGULATORS" | "ANTI AGING-LONGEVITY" | "NUTRITIONAL SUPPLEMENTS";
  priceUSD: number;
  priceEUR: number;
  image?: string;
  imageAlt?: string;
  rating: number;
  sizes: number;
  benefits: string[];
}

export default function ProductManager() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories = ["PEPTIDE BIOREGULATORS", "ANTI AGING-LONGEVITY", "NUTRITIONAL SUPPLEMENTS"];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    setEditingProduct({
      name: "",
      description: "",
      category: "PEPTIDE BIOREGULATORS",
      priceUSD: 0,
      priceEUR: 0,
      rating: 4.8,
      sizes: 1,
      benefits: [],
    });
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      priceUSD: product.priceUSD,
      priceEUR: product.priceEUR,
      image: product.image,
      imageAlt: product.imageAlt,
      rating: product.rating,
      sizes: product.sizes,
      benefits: product.benefits || [],
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setIsSaving(true);
    try {
      const success = await deleteProduct(productId);
      if (success) {
        toast.success("Product deleted successfully");
        loadProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    if (!editingProduct.name || !editingProduct.description || editingProduct.priceUSD <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSaving(true);
    try {
      if (editingProduct.id) {
        const success = await updateProduct(editingProduct.id, editingProduct);
        if (success) {
          toast.success("Product updated successfully");
          setIsDialogOpen(false);
          loadProducts();
        } else {
          toast.error("Failed to update product");
        }
      } else {
        const success = await createProduct(editingProduct);
        if (success) {
          toast.success("Product created successfully");
          setIsDialogOpen(false);
          loadProducts();
        } else {
          toast.error("Failed to create product");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error saving product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="sm" onClick={() => setLocation("/admin")}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
                </Button>
              </div>
              <h1 className="text-4xl font-bold mb-2">Product Manager</h1>
              <p className="text-gray-600">Create, edit, and manage all products in your catalog</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddProduct} className="bg-gradient-to-r from-orange-500 to-rose-500">
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct?.id ? "Edit Product" : "Add New Product"}</DialogTitle>
                  <DialogDescription>
                    {editingProduct?.id ? "Update the product details below" : "Fill in the product information"}
                  </DialogDescription>
                </DialogHeader>
                {editingProduct && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input id="name" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="e.g., Bonomarlot" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea id="description" value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} placeholder="Product description" rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={editingProduct.category} onValueChange={(value: any) => setEditingProduct({...editingProduct, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceUSD">Price (USD) *</Label>
                      <Input id="priceUSD" type="number" step="0.01" value={editingProduct.priceUSD} onChange={(e) => setEditingProduct({...editingProduct, priceUSD: parseFloat(e.target.value) || 0})} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceEUR">Price (EUR)</Label>
                      <Input id="priceEUR" type="number" step="0.01" value={editingProduct.priceEUR} onChange={(e) => setEditingProduct({...editingProduct, priceEUR: parseFloat(e.target.value) || 0})} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Input id="rating" type="number" step="0.1" min="0" max="5" value={editingProduct.rating} onChange={(e) => setEditingProduct({...editingProduct, rating: parseFloat(e.target.value) || 4.8})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sizes">Number of Sizes</Label>
                      <Input id="sizes" type="number" min="1" value={editingProduct.sizes} onChange={(e) => setEditingProduct({...editingProduct, sizes: parseInt(e.target.value) || 1})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input id="image" value={editingProduct.image || ""} onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="/products/image.png" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageAlt">Image Alt Text</Label>
                      <Input id="imageAlt" value={editingProduct.imageAlt || ""} onChange={(e) => setEditingProduct({...editingProduct, imageAlt: e.target.value})} placeholder="Alternative text for image" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="benefits">Benefits (comma-separated)</Label>
                      <Textarea id="benefits" value={editingProduct.benefits.join(", ")} onChange={(e) => setEditingProduct({...editingProduct, benefits: e.target.value.split(",").map((b) => b.trim()).filter((b) => b)})} placeholder="e.g., Immune system support, Heart health" rows={2} />
                    </div>
                    <Button onClick={handleSaveProduct} disabled={isSaving} className="w-full bg-gradient-to-r from-orange-500 to-rose-500">
                      {isSaving ? "Saving..." : "Save Product"}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (<SelectItem key={category} value={category}>{category}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-500">Loading products...</p>
              </CardContent>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-500">
                  {searchQuery || selectedCategory !== "all" ? "No products found matching your criteria" : "No products yet. Create one to get started!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="flex items-center justify-between gap-4 p-6">
                    <div className="flex items-center gap-4 flex-1">
                      {product.image && (<img src={product.image} alt={product.imageAlt || product.name} className="w-20 h-20 object-cover rounded-md" />)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-600">${product.priceUSD.toFixed(2)}</span>
                          <span className="text-gray-600">{product.category}</span>
                          <span className="text-yellow-500">★ {product.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)} disabled={isSaving}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
