import { Heart, ShoppingBag, Trash2, Eye, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import { Link } from "wouter";
import { useState } from "react";

export default function Wishlist() {
  const { favorites, removeFromFavorites, isRemovingFromFavorites } = useFavorites();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelectItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === favorites.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(favorites.map((f: any) => f.productId));
    }
  };

  const removeSelectedItems = () => {
    selectedItems.forEach(productId => {
      removeFromFavorites(productId);
    });
    setSelectedItems([]);
  };

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">თქვენი რჩეული სია ცარიელია</h2>
          <p className="text-gray-500 mb-8">დაამატეთ პროდუქტები რჩეულებში რათა ნახოთ ისინი აქ</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">
              შოპინგის გაგრძელება
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">რჩეული პროდუქტები</h1>
            <p className="text-gray-600 mt-1">{favorites.length} პროდუქტი</p>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {selectedItems.length} არჩეული
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={removeSelectedItems}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                არჩეულების წაშლა
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === favorites.length && favorites.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  ყველას არჩევა
                </span>
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedItems.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedItems([])}
                  className="text-gray-600"
                >
                  <X className="h-4 w-4 mr-1" />
                  გაუქმება
                </Button>
              )}
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">პროდუქტი</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">ფასი</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">მოქმედებები</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {favorites.map((favorite: any) => (
                  <tr 
                    key={favorite.productId} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedItems.includes(favorite.productId) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(favorite.productId)}
                        onChange={() => toggleSelectItem(favorite.productId)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    
                    {/* Product Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-16 h-16">
                          <img
                            src={favorite.productImage || favorite.imageUrl || '/placeholder-product.jpg'}
                            alt={favorite.productTitle || favorite.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={favorite.productUrl || `/product/${favorite.productId}`}>
                            <h3 className="text-sm font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2">
                              {favorite.productTitle || favorite.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {favorite.productId}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Price */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-primary">
                          {favorite.productPrice || favorite.price}₾
                        </span>
                        {favorite.oldPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {favorite.oldPrice}₾
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => {
                            console.log('Add to cart:', favorite.productId);
                          }}
                          title="კალათაში დამატება"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </Button>
                        
                        <Link href={favorite.productUrl || `/product/${favorite.productId}`}>
                          <Button size="sm" variant="outline" title="პროდუქტის ნახვა">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeFromFavorites(favorite.productId)}
                          disabled={isRemovingFromFavorites}
                          title="რჩეულებიდან მოშლა"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">
            სულ {favorites.length} პროდუქტი რჩეულებში
          </div>
          
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline">
                შოპინგის გაგრძელება
              </Button>
            </Link>
            
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                console.log('Add all to cart');
              }}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              ყველას კალათაში დამატება
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}