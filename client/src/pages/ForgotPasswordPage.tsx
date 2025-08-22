import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Mail, Phone, ArrowLeft, Send, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSmsSent, setIsSmsSent] = useState(false);

  // Email reset mutation
  const emailResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/auth/forgot-password-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'შეცდომა მოხდა');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsEmailSent(true);
      toast({
        title: "წარმატება",
        description: "დროებითი პაროლი გაიგზავნა თქვენს ელ-ფოსტაზე",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "შეცდომა",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // SMS reset mutation
  const smsResetMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch('/api/auth/forgot-password-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'შეცდომა მოხდა');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsSmsSent(true);
      toast({
        title: "წარმატება",
        description: "დროებითი პაროლი გაიგზავნა თქვენს ტელეფონზე SMS-ით",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "შეცდომა",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეიყვანოთ ელ-ფოსტის მისამართი",
        variant: "destructive",
      });
      return;
    }
    emailResetMutation.mutate(email);
  };

  const handleSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეიყვანოთ ტელეფონის ნომერი",
        variant: "destructive",
      });
      return;
    }
    smsResetMutation.mutate(phone);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              უკან შესვლაზე
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            პაროლის აღდგენა
          </h1>
          <p className="text-gray-600 text-center text-sm">
            აირჩიეთ პაროლის აღდგენის მეთოდი
          </p>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-center">
              პაროლის აღდგენა
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  ელ-ფოსტა
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  SMS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                {isEmailSent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      ელ-ფოსტა გაიგზავნა
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      დროებითი პაროლი გაიგზავნა მისამართზე: <strong>{email}</strong>
                    </p>
                    <p className="text-gray-500 text-xs mb-4">
                      შეამოწმეთ ელ-ფოსტის საქაღალდე. თუ წერილი არ გამოჩნდა, შეამოწმეთ spam საქაღალდე.
                    </p>
                    <Link to="/login">
                      <Button className="w-full">
                        შესვლა დროებითი პაროლით
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">ელ-ფოსტის მისამართი</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1"
                        disabled={emailResetMutation.isPending}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        შეიყვანეთ თქვენი რეგისტრირებული ელ-ფოსტის მისამართი
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={emailResetMutation.isPending}
                    >
                      {emailResetMutation.isPending ? (
                        <>
                          <Send className="h-4 w-4 mr-2 animate-pulse" />
                          იგზავნება...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          ელ-ფოსტით გაგზავნა
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="sms">
                {isSmsSent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      SMS გაიგზავნა
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      დროებითი პაროლი გაიგზავნა ნომერზე: <strong>{phone}</strong>
                    </p>
                    <p className="text-gray-500 text-xs mb-4">
                      SMS-ის მიღება შეიძლება რამდენიმე წუთი დასჭირდეს.
                    </p>
                    <Link to="/login">
                      <Button className="w-full">
                        შესვლა დროებითი პაროლით
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSmsSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="phone">ტელეფონის ნომერი</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="514170055 ან 995514170055"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1"
                        disabled={smsResetMutation.isPending}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        შეიყვანეთ თქვენი რეგისტრირებული ტელეფონის ნომერი
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={smsResetMutation.isPending}
                    >
                      {smsResetMutation.isPending ? (
                        <>
                          <Send className="h-4 w-4 mr-2 animate-pulse" />
                          იგზავნება...
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-2" />
                          SMS-ით გაგზავნა
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            გახსოვდათ პაროლი?{" "}
            <Link to="/login" className="text-[#5b38ed] hover:underline font-medium">
              შესვლა
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}