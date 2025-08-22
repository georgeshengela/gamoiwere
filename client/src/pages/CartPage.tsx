import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Trash2, ArrowLeft, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/components/cart/CartContext';

export default function CartPage() {
  const [couponCode, setCouponCode] = useState('');
  const { toast } = useToast();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  // Handle removing item from cart - pass the full item object
  const handleRemoveItem = (item: any) => {
    removeItem(item);
  };

  // Handle updating item quantity - pass the full item object
  const handleUpdateQuantity = (item: any, quantity: number) => {
    updateQuantity(item, quantity);
  };

  // Final total is just the products total
  const finalTotal = totalPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Mobile-optimized header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 mb-4 md:mb-6">
          <Link href="/" className="flex items-center text-gray-600 hover:text-primary transition-colors sm:mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm sm:text-base">მთავარზე დაბრუნება</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">ჩემი კალათა</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg p-6 md:p-8 text-center shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <ShoppingBag className="h-12 sm:h-16 w-12 sm:w-16 text-gray-300" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2">თქვენი კალათა ცარიელია</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 px-2">
              თქვენს კალათაში პროდუქტები არ არის. გადადით მთავარ გვერდზე სასურველი პროდუქტის შესაძენად.
            </p>
            <Link href="/">
              <Button className="px-6 w-full sm:w-auto">პროდუქტების ნახვა</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-3 md:p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <h2 className="font-bold text-base md:text-lg">ჩემი პროდუქტები ({totalItems})</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm self-start sm:self-auto"
                    onClick={clearCart}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">კალათის გასუფთავება</span>
                    <span className="sm:hidden">გასუფთავება</span>
                  </Button>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.variationId || item.id} className="p-3 md:p-4">
                      {/* Mobile-first layout - stacked on small screens */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        {/* Product Image and Info */}
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 flex-shrink-0 rounded border border-gray-100 overflow-hidden">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${item.id}`}>
                              <h3 className="font-medium text-sm sm:text-base hover:text-primary line-clamp-2">{item.name}</h3>
                            </Link>
                            {item.variations && Object.keys(item.variations).length > 0 && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-1 sm:gap-2">
                                {Object.entries(item.variations).map(([key, value], index) => (
                                  <div key={key} className="flex items-center">
                                    {index > 0 && <span className="mx-1 text-gray-300">•</span>}
                                    <span className="mr-1">{key}:</span>
                                    {key === 'ფერის_კოდი' ? (
                                      <div 
                                        className="w-3 h-3 rounded-full border border-gray-300 mr-1" 
                                        style={{ backgroundColor: value || '#FFF' }}
                                        title={value}
                                      ></div>
                                    ) : (
                                      <span className="font-medium">{value}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Mobile price display */}
                            <div className="sm:hidden mt-2">
                              <div className="font-bold text-primary text-lg">₾{(item.price * item.quantity).toFixed(2)}</div>
                              <div className="text-xs text-gray-500">₾{item.price.toFixed(2)} / ერთეული</div>
                            </div>
                          </div>

                          {/* Mobile delete button */}
                          <button 
                            className="sm:hidden p-2 text-gray-400 hover:text-red-500 -mt-1"
                            onClick={() => handleRemoveItem(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Quantity and Price Controls - Mobile optimized */}
                        <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center">
                            <button 
                              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-200 rounded-l-md hover:bg-gray-50 active:bg-gray-100"
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3 sm:h-3 sm:w-3" />
                            </button>
                            <div className="w-12 h-9 sm:w-10 sm:h-8 flex items-center justify-center border-t border-b border-gray-200 text-sm sm:text-sm">
                              {item.quantity}
                            </div>
                            <button 
                              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-200 rounded-r-md hover:bg-gray-50 active:bg-gray-100"
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 sm:h-3 sm:w-3" />
                            </button>
                          </div>

                          {/* Desktop price display */}
                          <div className="hidden sm:block text-right">
                            <div className="font-bold text-primary">₾{(item.price * item.quantity).toFixed(2)}</div>
                            <div className="text-xs text-gray-500">₾{item.price.toFixed(2)} / ერთეული</div>
                          </div>

                          {/* Desktop delete button */}
                          <button 
                            className="hidden sm:block p-1 text-gray-400 hover:text-red-500"
                            onClick={() => handleRemoveItem(item)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          {/* Order Summary - Mobile Optimized */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6 lg:sticky lg:top-8">
              <h2 className="font-bold text-lg md:text-xl mb-4 md:mb-6">შეკვეთის დეტალები</h2>
              
              {/* Summary Items */}
              <div className="space-y-3 mb-4 md:mb-6">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm md:text-base">ჯამური ღირებულება</span>
                  <span className="font-semibold text-sm md:text-base">₾{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Section - Mobile Optimized */}
              <div className="mb-4 md:mb-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Input
                    type="text"
                    placeholder="კუპონის კოდი"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 sm:rounded-r-none text-sm md:text-base h-10 md:h-11"
                  />
                  <Button 
                    variant="outline" 
                    className="sm:rounded-l-none border-t-0 sm:border-t sm:border-l-0 text-xs md:text-sm h-10 md:h-11 px-3 md:px-4"
                  >
                    გააქტიურება
                  </Button>
                </div>
              </div>

              <Separator className="my-4 md:my-6" />

              {/* Total Section */}
              <div className="flex justify-between items-center font-bold text-lg md:text-xl mb-4 md:mb-6 py-2 bg-gray-50 rounded-lg px-3">
                <span>ჯამი</span>
                <span className="text-primary">₾{finalTotal.toFixed(2)}</span>
              </div>

              {/* Checkout Button - Enhanced for Mobile */}
              <Link href="/checkout">
                <Button className="w-full text-base md:text-lg h-12 md:h-14 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  შეკვეთის გაფორმება
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}