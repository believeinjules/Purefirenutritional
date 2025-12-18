import { useState, useEffect } from 'react';
import InventoryManagement from '@/components/InventoryManagement';
import { useLocation } from 'wouter';
import {
  BarChart3,
  ShoppingCart,
  MessageSquare,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Package,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
  getProductReviews,
  updateReviewStatus,
  deleteReview,
  getPendingReviews,
  type ProductReview
} from '@/lib/reviewStorage';
import {
  getAbandonedCartStats,
  getCartsNeedingRecovery,
  markRecoveryEmailSent,
  type AbandonedCart
} from '@/lib/abandonedCartStorage';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function Admin() {
  const [, setLocation] = useLocation();
  const [pendingReviews, setPendingReviews] = useState<ProductReview[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [cartStats, setCartStats] = useState({
    totalAbandoned: 0,
    totalValue: 0,
    recoveryEmailsSent: 0,
    recovered: 0,
    recoveryRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviews, carts, stats] = await Promise.all([
        getPendingReviews(),
        getCartsNeedingRecovery(),
        getAbandonedCartStats()
      ]);
      setPendingReviews(reviews);
      setAbandonedCarts(carts);
      setCartStats(stats);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    await updateReviewStatus(reviewId, 'approved');
    loadData();
  };

  const handleRejectReview = async (reviewId: string) => {
    await updateReviewStatus(reviewId, 'rejected');
    loadData();
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review permanently?')) {
      await deleteReview(reviewId);
      loadData();
    }
  };

  const handleSendRecoveryEmail = async (cartId: string) => {
    await markRecoveryEmailSent(cartId);
    loadData();
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Supabase Not Configured</CardTitle>
              <CardDescription>
                The admin dashboard requires Supabase to be set up.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Please follow the setup instructions in DEPLOYMENT.md to configure your Supabase database.
              </p>
              <Button onClick={() => setLocation('/')}>Return to Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Manage reviews, monitor abandoned carts, and track key metrics
              </p>
            </div>
            <Button onClick={() => setLocation('/admin/products')}>
              <Package className="mr-2 h-4 w-4" />
              Manage Products
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReviews.length}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting moderation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abandoned Carts</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cartStats.totalAbandoned}</div>
                <p className="text-xs text-muted-foreground">
                  ${cartStats.totalValue.toFixed(2)} total value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cartStats.recoveryRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {cartStats.recovered} carts recovered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recovery Emails</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cartStats.recoveryEmailsSent}</div>
                <p className="text-xs text-muted-foreground">
                  Sent to customers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="reviews" className="space-y-4">
            <TabsList>
              <TabsTrigger value="reviews">
                Review Moderation
                {pendingReviews.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingReviews.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="carts">
                Abandoned Carts
                {abandonedCarts.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {abandonedCarts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="inventory">
                Inventory Management
              </TabsTrigger>
            </TabsList>

            {/* Review Moderation Tab */}
            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Reviews</CardTitle>
                  <CardDescription>
                    Review and moderate customer product reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading...</p>
                  ) : pendingReviews.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No pending reviews to moderate
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Review</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingReviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell className="font-medium">
                              {review.productId}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{review.customerName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {review.customerEmail}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{review.rating}</span>
                                <span className="text-yellow-400">★</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                {review.title && (
                                  <div className="font-medium mb-1">{review.title}</div>
                                )}
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {review.reviewText}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApproveReview(review.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectReview(review.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteReview(review.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Abandoned Carts Tab */}
            <TabsContent value="carts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Abandoned Carts Needing Recovery</CardTitle>
                  <CardDescription>
                    Carts abandoned for 24+ hours without recovery email sent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading...</p>
                  ) : abandonedCarts.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No abandoned carts need recovery emails
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Abandoned</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {abandonedCarts.map((cart) => (
                          <TableRow key={cart.id}>
                            <TableCell>
                              <div>
                                {cart.customerName && (
                                  <div className="font-medium">{cart.customerName}</div>
                                )}
                                <div className="text-sm text-muted-foreground">
                                  {cart.customerEmail || 'No email provided'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {cart.itemCount} items
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              ${cart.totalAmount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {new Date(cart.lastActivityAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => handleSendRecoveryEmail(cart.id)}
                                disabled={!cart.customerEmail}
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Send Recovery Email
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Management Tab */}
            <TabsContent value="inventory" className="space-y-4">
              <InventoryManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
