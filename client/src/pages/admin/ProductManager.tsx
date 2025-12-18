import { useState } from "react";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Upload, Search } from "lucide-react";
import { toast } from "sonner";

interface ProductFormData {
  id: string;
  name: string;
  description: string;
  category: string;
  priceUSD: number;
  priceEUR: number;
  image: string;
  imageAlt: string;
  rating: number;
  sizes: number;
  benefits: string[];
}

export default function ProductManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: any) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      priceUSD: product.priceUSD,
      priceEUR: product.priceEUR,
      image: product.image || "",
      imageAlt: product.imageAlt || "",
      rating: product.rating,
      sizes: product.sizes,
      benefits: product.benefits || [],
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll just show a success message
      toast.success("Product updated successfully!");
      setIsDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      // In a real implementation, this would call an API endpoint
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real implementation, this would upload to a server
    const reader = new FileReader();
    reader.onloadend = () => {
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          image: reader.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
    toast.success("Image uploaded successfully!");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Product Manager</h1>
          <p className="text-muted-foreground">
            Manage your product catalog, prices, and inventory
          </p>
        </div>
        <Button onClick={() => {
          setEditingProduct({
            id: "",
            name: "",
            description: "",
            category: "PEPTIDE BIOREGULATORS",
            priceUSD: 0,
            priceEUR: 0,
            image: "",
            imageAlt: "",
            rating: 4.5,
            sizes: 1,
            benefits: [],
          });
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product List */}
      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex items-center gap-4 p-6">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.imageAlt || product.name}
                className="w-20 h-20 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="font-medium">${product.priceUSD}</span>
                  <span className="text-muted-foreground">
                    {product.category}
                  </span>
                  <span className="text-muted-foreground">
                    ⭐ {product.rating}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.id ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              Update product details, pricing, and images
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="flex items-center gap-4">
                  {editingProduct.image && (
                    <img
                      src={editingProduct.image}
                      alt="Product preview"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editingProduct.category}
                  onValueChange={(value) =>
                    setEditingProduct({ ...editingProduct, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceUSD">Price (USD)</Label>
                  <Input
                    id="priceUSD"
                    type="number"
                    step="0.01"
                    value={editingProduct.priceUSD}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        priceUSD: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceEUR">Price (EUR)</Label>
                  <Input
                    id="priceEUR"
                    type="number"
                    step="0.01"
                    value={editingProduct.priceEUR}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        priceEUR: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Rating and Sizes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editingProduct.rating}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        rating: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sizes">Available Sizes</Label>
                  <Input
                    id="sizes"
                    type="number"
                    value={editingProduct.sizes}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sizes: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Image Alt Text */}
              <div className="space-y-2">
                <Label htmlFor="imageAlt">Image Alt Text (SEO)</Label>
                <Input
                  id="imageAlt"
                  value={editingProduct.imageAlt}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      imageAlt: e.target.value,
                    })
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingProduct.id ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
