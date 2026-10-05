import { Link } from 'wouter';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { products } from '@/data/products';
import { getDefaultCartSize } from '@/lib/productSize';
import { toast } from 'sonner';

export default function Wishlist() {
  // Wishlist is stored in localStorage by WishlistContext ({ id, name, price, image })
  const { items: wishlist, removeItem } = useWishlist();
  const { addToCart } = useCart();

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const handleRemove = (productId: string) => {
    removeItem(productId);
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (productId: string) => {
    const product = getProduct(productId);
    if (product) {
      // Cart refreshes the product to live (Firestore) prices; checkout charges those.
      addToCart(product, 1, getDefaultCartSize(product));
      toast.success('Added to cart');
    } else {
      toast.error("This product is no longer available");
    }
  };

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
                const product = getProduct(item.id);
                const image = item.image || product?.image || '/placeholder-product.jpg';
                const name = product?.name || item.name;

                return (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Link href={`/product/${item.id}`}>
                        <img
                          src={image}
                          alt={name}
                          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemove(item.id)}
                        aria-label={`Remove ${name} from wishlist`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="p-4">
                      <Link href={`/product/${item.id}`}>
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary cursor-pointer">
                          {name}
                        </h3>
                      </Link>

                      {Number.isFinite(item.price) && item.price > 0 && (
                        <p className="text-2xl font-bold text-primary mb-3">
                          ${item.price.toFixed(2)}
                        </p>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(item.id)}
                        disabled={!product}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product ? 'Add to Cart' : 'No longer available'}
                      </Button>
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
