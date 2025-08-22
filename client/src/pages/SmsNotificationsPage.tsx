import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Phone, Clock, CheckCircle, XCircle, AlertCircle, Smartphone, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface SmsLog {
  id: number;
  recipientPhone: string;
  message: string;
  status: string;
  messageId?: string;
  errorMessage?: string;
  sentBy?: number;
  sentAt: string;
}

export default function SmsNotificationsPage() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch SMS balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/admin/sms-balance"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch SMS logs
  const { data: smsLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/sms-logs"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Send test SMS mutation
  const sendTestSms = useMutation({
    mutationFn: async (data: { phone: string; message: string }) => {
      return await apiRequest("/api/admin/send-test-sms", {
        method: "POST",
        data,
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "SMS გაიგზავნა",
        description: `SMS წარმატებით გაიგზავნა ${data.to}-ზე`,
      });
      setPhone("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sms-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sms-balance"] });
    },
    onError: (error: any) => {
      toast({
        title: "შეცდომა",
        description: error.message || "SMS-ის გაგზავნისას მოხდა შეცდომა",
        variant: "destructive",
      });
    },
  });

  const handleSendTestSms = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !message) {
      toast({
        title: "შეცდომა",
        description: "ტელეფონის ნომერი და შეტყობინება სავალდებულოა",
        variant: "destructive",
      });
      return;
    }

    // Phone validation for Georgian numbers - accept both 9-digit and full format
    const georgianMobilePattern = /^(995)?\d{9}$/;
    if (!georgianMobilePattern.test(phone.replace(/\s/g, ''))) {
      toast({
        title: "შეცდომა",
        description: "შეიყვანეთ სწორი ქართული მობილური ნომერი",
        variant: "destructive",
      });
      return;
    }

    sendTestSms.mutate({ phone, message });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-light">
            <CheckCircle className="w-3 h-3 mr-1" />
            გაგზავნილია
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            ვერ გაიგზავნა
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            მუშავდება
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            უცნობი
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ka-GE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate SMS statistics from logs
  const smsStats = React.useMemo(() => {
    if (!Array.isArray(smsLogs)) return { total: 0, successful: 0, failed: 0 };
    
    const total = smsLogs.length;
    const successful = smsLogs.filter((log: SmsLog) => log.status === 'sent').length;
    const failed = smsLogs.filter((log: SmsLog) => log.status === 'failed').length;
    
    return { total, successful, failed };
  }, [smsLogs]);

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                SMS ნოტიფიკაციები
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                SMS შეტყობინებების გაგზავნა და მონიტორინგი
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/admin")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              უკან დაბრუნება
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                SMS ბალანსი & სტატისტიკა
              </CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <div className="text-gray-500">იტვირთება...</div>
              ) : (
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {balanceData?.balance || 0} SMS
                  </div>
                  <div className="text-sm text-gray-500">
                    დარჩენილი ბალანსი
                  </div>
                  
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">სულ გაგზავნილი:</span>
                      <span className="font-semibold text-gray-900">{smsStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">წარმატებული:</span>
                      <span className="font-semibold text-green-700">{smsStats.successful}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-600">ვერ გაიგზავნა:</span>
                      <span className="font-semibold text-red-700">{smsStats.failed}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Send Test SMS Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="tracking-tight flex items-center text-[20px] font-light">
                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                სატესტო SMS გაგზავნა
              </CardTitle>
              <CardDescription>
                გაგზავეთ სატესტო SMS შეტყობინება SMS Office API-ს მეშვეობით
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendTestSms} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">ტელეფონის ნომერი</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="514170055 ან 995514170055"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1"
                      disabled={sendTestSms.isPending}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      შეიყვანეთ 9-ნიშნა ნომერი (514170055) ან სრული ნომერი (995514170055)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="message">შეტყობინება</Label>
                    <Textarea
                      id="message"
                      placeholder="შეიყვანეთ შეტყობინების ტექსტი..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1"
                      rows={3}
                      disabled={sendTestSms.isPending}
                      maxLength={1000}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      მაქსიმუმ 1000 სიმბოლო
                    </p>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={sendTestSms.isPending || !phone || !message}
                  className="w-full md:w-auto"
                >
                  {sendTestSms.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      იგზავნება...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      SMS გაგზავნა
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* SMS Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="tracking-tight flex items-center text-[20px] font-light">
              <Clock className="w-5 h-5 mr-2 text-gray-600" />
              SMS ისტორია
            </CardTitle>
            <CardDescription>
              ყველა გაგზავნილი SMS შეტყობინების ისტორია
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">იტვირთება...</div>
              </div>
            ) : smsLogs.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">SMS ისტორია ცარიელია</p>
              </div>
            ) : (
              <div className="space-y-4">
                {smsLogs.slice(0, 20).map((log: SmsLog) => (
                  <div
                    key={log.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <div className="flex items-center mb-2 md:mb-0">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-mono text-sm">{log.recipientPhone}</span>
                        <div className="ml-4">
                          {getStatusBadge(log.status)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(log.sentAt)}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {log.message}
                      </p>
                    </div>
                    {log.errorMessage && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>შეცდომა:</strong> {log.errorMessage}
                        </p>
                      </div>
                    )}
                    {log.messageId && (
                      <div className="text-xs text-gray-500 mt-2">
                        Message ID: {log.messageId}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}