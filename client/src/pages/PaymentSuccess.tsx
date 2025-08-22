import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Package, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PaymentStatusData {
  success: boolean;
  order?: {
    id: number;
    externalOrderId: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  };
  bogDetails?: any;
}

export default function PaymentSuccess() {
  const [location, navigate] = useLocation();
  const [paymentData, setPaymentData] = useState<PaymentStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      fetchPaymentStatus();
    }
  }, [orderId]);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bog-payment/status/${orderId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentData(data);
      } else {
        console.error('Failed to fetch payment status');
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
        <Card className="w-full max-w-md p-8">
          <CardContent className="text-center">
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">გადახდის სტატუსის შემოწმება...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            გადახდა წარმატებულია!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            თქვენი შეკვეთა მიღებულია და დამუშავების პროცესშია
          </p>

          {/* Order Details */}
          {paymentData?.order && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6 text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                შეკვეთის დეტალები
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">შეკვეთის ID:</span>
                  <span className="font-mono text-sm">{paymentData.order.externalOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">თანხა:</span>
                  <span className="font-semibold">₾{paymentData.order.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">სტატუსი:</span>
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {paymentData.order.status === 'paid' ? 'გადახდილი' : paymentData.order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">თარიღი:</span>
                  <span>{new Date(paymentData.order.createdAt).toLocaleDateString('ka-GE')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Package className="w-6 h-6 text-blue-600 mt-1" />
              <div className="text-left">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  შემდეგი ნაბიჯები
                </h4>
                <ul className="text-blue-800 dark:text-blue-200 space-y-2">
                  <li>• შეკვეთა დამუშავების პროცესშია</li>
                  <li>• მიიღებთ EMAIL დადასტურებას</li>
                  <li>• SMS შეტყობინებით მისდევთ პროცესს</li>
                  <li>• პროდუქტები ჩინეთში მიღების შემდეგ</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/orders')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
            >
              <Package className="w-4 h-4 mr-2" />
              ჩემი შეკვეთები
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="px-8 py-3"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              მთავარ გვერდზე დაბრუნება
            </Button>
          </div>

          {/* Support Information */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              კითხვები გაქვთ? დაგვიკავშირდით:
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              📧 support@gamoiwere.ge | 📱 +995 XXX XXX XXX
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}