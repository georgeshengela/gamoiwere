import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { XCircle, ArrowLeft, RefreshCw, AlertTriangle, Phone, Mail } from 'lucide-react';
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

export default function PaymentFailed() {
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

  const handleRetryPayment = () => {
    // Navigate back to cart or payment page to retry
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20">
        <Card className="w-full max-w-md p-8">
          <CardContent className="text-center">
            <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">გადახდის სტატუსის შემოწმება...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            გადახდა ვერ განხორციელდა
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            თქვენი გადახდა არ დასრულებულა წარმატებით
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
                  <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {paymentData.order.status === 'failed' ? 'ვერ განხორციელდა' : paymentData.order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">თარიღი:</span>
                  <span>{new Date(paymentData.order.createdAt).toLocaleDateString('ka-GE')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Common Issues */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
              <div className="text-left">
                <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  შესაძლო მიზეზები
                </h4>
                <ul className="text-orange-800 dark:text-orange-200 space-y-2">
                  <li>• არასაკმარისი ნაშთი ბარათზე</li>
                  <li>• ბარათის ვადის გასვლა</li>
                  <li>• არასწორი ბარათის მონაცემები</li>
                  <li>• ინტერნეტ კავშირის პრობლემა</li>
                  <li>• ბანკის უსაფრთხოების შეზღუდვები</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={handleRetryPayment}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              თავიდან ცადეთ
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="px-8 py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              მთავარ გვერდზე დაბრუნება
            </Button>
          </div>

          {/* Support Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              დახმარება საჭიროა?
            </h4>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              ჩვენი ტექნიკური მხარდაჭერის გუნდი მზადაა დაგეხმაროთ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@gamoiwere.ge"
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                support@gamoiwere.ge
              </a>
              <a
                href="tel:+995xxxxxxxxx"
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                +995 XXX XXX XXX
              </a>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              💡 რჩევა: დარწმუნდით რომ ბარათზე საკმარისი ნაშთია და ინტერნეტ კავშირი სტაბილურია
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}