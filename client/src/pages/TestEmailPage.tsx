import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Mail, Loader2, Clock, CheckCircle, XCircle, AlertCircle, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, isValid, parseISO } from "date-fns";

export default function TestEmailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: ""
  });

  // Fetch default email template
  const { data: templates } = useQuery({
    queryKey: ["/api/admin/email-templates"],
    retry: false,
  });

  // Fetch email logs
  const { data: emailLogs, isLoading: emailLogsLoading } = useQuery({
    queryKey: ["/api/admin/email-logs"],
    retry: false,
  });

  // Load default template when templates are fetched
  useEffect(() => {
    if (templates && Array.isArray(templates)) {
      const defaultTemplate = templates.find((template: any) => template.is_default === true);
      if (defaultTemplate && (!emailData.subject && !emailData.message)) {
        setEmailData(prev => ({
          ...prev,
          subject: defaultTemplate.subject || "",
          message: defaultTemplate.message || ""
        }));
      }
    }
  }, [templates]);

  // Send test email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (data: typeof emailData) => 
      apiRequest("/api/admin/send-test-email", {
        method: "POST",
        data: { to: data.to }, // Only send recipient email, backend will use default template
      }),
    onSuccess: () => {
      toast({
        title: "წარმატება",
        description: "სატესტო მეილი წარმატებით გაიგზავნა",
      });
      // Reset to default template
      if (templates && Array.isArray(templates)) {
        const defaultTemplate = templates.find((template: any) => template.is_default === true);
        setEmailData({
          to: "",
          subject: defaultTemplate?.subject || "",
          message: defaultTemplate?.message || ""
        });
      } else {
        setEmailData({
          to: "",
          subject: "",
          message: ""
        });
      }
      // Refresh email logs
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-logs"] });
    },
    onError: (error: any) => {
      toast({
        title: "შეცდომა",
        description: error.message || "მეილის გაგზავნა ვერ მოხერხდა",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailData.to) {
      toast({
        title: "შეცდომა",
        description: "მიმღების ელ.ფოსტის მისამართის შევსება აუცილებელია",
        variant: "destructive",
      });
      return;
    }
    sendEmailMutation.mutate(emailData);
  };

  const handleInputChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">თქვენ არ გაქვთ ამ გვერდზე წვდომა</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-600" />
              <h1 className="text-gray-900 text-[22px] font-normal">სატესტო მეილის გაგზავნა</h1>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ადმინ პანელზე დაბრუნება
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">Gmail API-ს გამოყენებით სატესტო მეილის გაგზავნა</p>
        </div>

        {/* Current Template Info */}
        {(() => {
          const defaultTemplate = templates && Array.isArray(templates) 
            ? templates.find((template: any) => template.is_default === true)
            : null;
          
          return defaultTemplate ? (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span>მიმდინარე შაბლონი</span>
                  </div>
                  <Link href="/admin/email-templates">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      შაბლონის რედაქტირება
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">შაბლონის სახელი:</p>
                    <p className="text-blue-800 font-medium">{defaultTemplate.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">სათაური:</p>
                    <p className="text-gray-800">{defaultTemplate.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">შეტყობინება:</p>
                    <div className="bg-white p-3 rounded border text-sm text-gray-800 max-h-24 overflow-y-auto">
                      {defaultTemplate.message}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null;
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="tracking-tight flex items-center gap-2 font-normal text-[18px]">
                  <Send className="h-5 w-5" />
                  მეილის დეტალები
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="to">მიმღები (To)</Label>
                    <Input
                      id="to"
                      type="email"
                      value={emailData.to}
                      onChange={(e) => handleInputChange("to", e.target.value)}
                      placeholder="recipient@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">თემა (Subject)</Label>
                    <Input
                      id="subject"
                      value={emailData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="მეილის თემა"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">მესიჯი (Message)</Label>
                    <Textarea
                      id="message"
                      value={emailData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="მეილის შინაარსი"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      disabled={sendEmailMutation.isPending}
                      className="flex-1"
                    >
                      {sendEmailMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          იგზავნება...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          გაგზავნა
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEmailData({
                        to: "",
                        subject: "Test Email from GAMOIWERE.GE",
                        message: "ეს არის სატესტო მეილი GAMOIWERE.GE-დან. თუ ამ მეილს იღებთ, ეს ნიშნავს რომ მეილის სისტემა სწორად მუშაობს."
                      })}
                    >
                      გასუფთავება
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Email Configuration Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">კონფიგურაცია</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>გამგზავნი:</strong> noreply@gamoiwere.ge</p>
                  <p><strong>სერვისი:</strong> Gmail API</p>
                  <p><strong>სტატუსი:</strong> <span className="text-green-600">აქტიური</span></p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email History Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="tracking-tight flex items-center gap-2 text-[18px] font-normal">
                  <Clock className="h-5 w-5" />
                  მეილების ისტორია
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emailLogsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : emailLogs && emailLogs.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {emailLogs.slice(0, 10).map((log: any) => (
                      <div
                        key={log.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {log.status === 'sent' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : log.status === 'failed' ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                            <Badge
                              variant={log.status === 'sent' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {log.status === 'sent' ? 'გაგზავნილი' : log.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {(() => {
                              try {
                                const date = new Date(log.sent_at);
                                return isValid(date) ? format(date, 'dd/MM/yyyy HH:mm') : 'უცნობი თარიღი';
                              } catch {
                                return 'უცნობი თარიღი';
                              }
                            })()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {log.recipient_email}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {log.subject}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.sent_at).toLocaleTimeString('ka-GE')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">მეილების ისტორია არ არის</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}