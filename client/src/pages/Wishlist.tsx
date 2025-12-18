import { Link } from 'wouter';
import { Heart, ShoppingCart, Trash2, Bell, BellOff } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { products } from '@/data/products';
import { toast } from 'sonner';

export default function Wishlist() {
  const { wishlist, removeItem, loading } = useWishlist();
  const { addToCart } = useCart();

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeItem(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (productId: string) => {
    const product = getProduct(productId);
    if (product) {
      addToCart(product);
      toast.success('Added to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Loading wishlist...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow py-12">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {wishlist.length === 0 
                ? 'Your wishlist is empty' 
                : `${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} saved for later`
              }
            </p>
          </div>

          {wishlist.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Save products you love to easily find them later
                </p>
                <Link href="/products">
                  <Button>
                    Browse Products
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;

                return (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Link href={`/product/${product.id}`}>
                        <img
                          src={product.image || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemove(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <CardContent className="p-4">
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            ${product.priceUSD.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            €{product.priceEUR.toFixed(2)}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          ⭐ {product.rating}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                        {item.notifyOnSale && (
                          <Badge variant="outline" className="gap-1">
                            <Bell className="h-3 w-3" />
                            Sale alerts
                          </Badge>
                        )}
                        {item.notifyOnRestock && (
                          <Badge variant="outline" className="gap-1">
                            <Bell className="h-3 w-3" />
                            Restock alerts
                          </Badge>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>

                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
