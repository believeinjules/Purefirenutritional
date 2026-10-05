import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { fetchProducts } from '@/lib/productsStorage';
import {
  ensureInventory,
  updateInventory,
  getInventoryHistory,
  isLowStock,
  type ProductInventory,
  type InventoryHistory
} from '@/lib/inventoryStorage';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [lowStockItems, setLowStockItems] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ProductInventory>>({});
  const [historyDialog, setHistoryDialog] = useState<string | null>(null);
  const [history, setHistory] = useState<InventoryHistory[]>([]);
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Live catalog (Firestore, code fallback) → names + ids for default records
      const catalog = await fetchProducts();
      setProductNames(Object.fromEntries(catalog.map((p) => [p.id, p.name])));

      // Creates default records only for products that have none, then returns all
      const allInv = await ensureInventory(catalog.map((p) => p.id));
      const sorted = [...allInv].sort((a, b) =>
        (catalog.find((p) => p.id === a.productId)?.name ?? a.productId).localeCompare(
          catalog.find((p) => p.id === b.productId)?.name ?? b.productId
        )
      );
      setInventory(sorted);
      setLowStockItems(sorted.filter(isLowStock));
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      setLoadError(error?.message ?? 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ProductInventory) => {
    setEditingId(item.productId);
    setEditValues({
      stockQuantity: item.stockQuantity,
      lowStockThreshold: item.lowStockThreshold,
      isInStock: item.isInStock,
      isAvailable: item.isAvailable
    });
  };

  const handleSave = async (productId: string) => {
    try {
      await updateInventory(productId, {
        stockQuantity: editValues.stockQuantity,
        lowStockThreshold: editValues.lowStockThreshold,
        isInStock: editValues.isInStock,
        isAvailable: editValues.isAvailable,
      });
      toast.success('Inventory updated');
      setEditingId(null);
      setEditValues({});
      loadInventory();
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      toast.error(`Save failed: ${error?.message ?? 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleViewHistory = async (productId: string) => {
    setHistoryDialog(productId);
    setHistory([]);
    try {
      setHistory(await getInventoryHistory(productId));
    } catch (error: any) {
      toast.error(`Could not load history: ${error?.message ?? 'Unknown error'}`);
    }
  };

  const getProductName = (productId: string) => productNames[productId] || productId;

  const getStockStatus = (item: ProductInventory) => {
    if (!item.isAvailable) return { label: 'Unavailable', color: 'bg-gray-500' };
    if (!item.isInStock) return { label: 'Out of Stock', color: 'bg-red-500' };
    if (item.stockQuantity <= item.lowStockThreshold) return { label: 'Low Stock', color: 'bg-yellow-500' };
    return { label: 'In Stock', color: 'bg-green-500' };
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-yellow-700">
              {lowStockItems.length} product{lowStockItems.length !== 1 ? 's' : ''} need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.productId} variant="outline" className="border-yellow-500">
                  {getProductName(item.productId)} ({item.stockQuantity} left)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Inventory
          </CardTitle>
          <CardDescription>
            Manage stock levels and availability for all products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading inventory...</p>
          ) : loadError ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-red-600 text-sm">Could not load inventory: {loadError}</p>
              <Button variant="outline" size="sm" onClick={loadInventory}>
                Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Stock Quantity</TableHead>
                  <TableHead>Low Stock Alert</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const isEditing = editingId === item.productId;
                  const status = getStockStatus(item);

                  return (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">
                        {getProductName(item.productId)}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.stockQuantity ?? item.stockQuantity}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              stockQuantity: parseInt(e.target.value)
                            })}
                            className="w-24"
                          />
                        ) : (
                          <span>{item.stockQuantity}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.lowStockThreshold ?? item.lowStockThreshold}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              lowStockThreshold: parseInt(e.target.value)
                            })}
                            className="w-24"
                          />
                        ) : (
                          <span>{item.lowStockThreshold}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Switch
                            checked={editValues.isAvailable ?? item.isAvailable}
                            onCheckedChange={(checked) => setEditValues({
                              ...editValues,
                              isAvailable: checked
                            })}
                          />
                        ) : (
                          <Switch
                            checked={item.isAvailable}
                            disabled
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(item.lastUpdatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSave(item.productId)}
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewHistory(item.productId)}
                                  >
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    History
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Inventory History</DialogTitle>
                                    <DialogDescription>
                                      {getProductName(item.productId)}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="max-h-96 overflow-y-auto">
                                    {history.length === 0 ? (
                                      <p className="text-center py-8 text-muted-foreground">
                                        No history available
                                      </p>
                                    ) : (
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Change</TableHead>
                                            <TableHead>Before</TableHead>
                                            <TableHead>After</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {history.map((h) => (
                                            <TableRow key={h.id}>
                                              <TableCell>
                                                {new Date(h.createdAt).toLocaleString()}
                                              </TableCell>
                                              <TableCell>
                                                <Badge variant="outline">
                                                  {h.changeType}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>
                                                <span className={h.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}>
                                                  {h.quantityChange > 0 ? '+' : ''}{h.quantityChange}
                                                </span>
                                              </TableCell>
                                              <TableCell>{h.quantityBefore}</TableCell>
                                              <TableCell>{h.quantityAfter}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
