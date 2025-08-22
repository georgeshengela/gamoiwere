import { useState } from "react";
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
import { 
  ArrowLeft, 
  Mail, 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  StarOff,
  Save,
  X,
  AlertTriangle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, isValid, parseISO } from "date-fns";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  message: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EmailTemplatesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
    isDefault: false
  });

  // Fetch email templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/admin/email-templates"],
    retry: false,
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: typeof formData) => 
      apiRequest("/api/admin/email-templates", {
        method: "POST",
        data: data,
      }),
    onSuccess: () => {
      toast({
        title: "წარმატება",
        description: "შაბლონი წარმატებით შეიქმნა",
      });
      setFormData({ name: "", subject: "", message: "", isDefault: false });
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "შეცდომა",
        description: error.message || "შაბლონის შექმნა ვერ მოხერხდა",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EmailTemplate> }) => 
      apiRequest(`/api/admin/email-templates/${id}`, {
        method: "PUT",
        data: data,
      }),
    onSuccess: () => {
      toast({
        title: "წარმატება",
        description: "შაბლონი წარმატებით განახლდა",
      });
      setEditingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "შეცდომა",
        description: error.message || "შაბლონის განახლება ვერ მოხერხდა",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/email-templates/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast({
        title: "წარმატება",
        description: "შაბლონი წარმატებით წაიშალა",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "შეცდომა",
        description: error.message || "შაბლონის წაშლა ვერ მოხერხდა",
        variant: "destructive",
      });
    },
  });

  // Set default template mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/email-templates/${id}/set-default`, {
        method: "POST",
      }),
    onSuccess: () => {
      toast({
        title: "წარმატება",
        description: "შაბლონი დაყენდა როგორც ნაგულისხმევი",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "შეცდომა",
        description: error.message || "ნაგულისხმევი შაბლონის დაყენება ვერ მოხერხდა",
        variant: "destructive",
      });
    },
  });

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTemplateMutation.mutate(formData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        data: editingTemplate
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("ნამდვილად გსურთ ამ შაბლონის წაშლა?")) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: number) => {
    setDefaultMutation.mutate(id);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, "dd/MM/yyyy HH:mm");
      }
    } catch (error) {
      console.error("Date parsing error:", error);
    }
    return "N/A";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">მეილის შაბლონები</h1>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                ახალი შაბლონი
              </Button>
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ადმინ პანელზე დაბრუნება
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-gray-600">მეილის შაბლონების მართვა და რედაქტირება</p>
        </div>

        {/* Current Default Template Info */}
        {templates && templates.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-yellow-500" />
                მიმდინარე ნაგულისხმევი შაბლონი
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const defaultTemplate = templates.find((t: EmailTemplate) => t.isDefault);
                if (defaultTemplate) {
                  return (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">შაბლონის სახელი:</p>
                          <p className="text-lg font-semibold text-blue-900">{defaultTemplate.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">მეილის თემა:</p>
                          <p className="text-sm text-gray-800">{defaultTemplate.subject}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">შაბლონის შინაარსი:</p>
                        <div className="bg-white p-3 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
                          {defaultTemplate.message}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTemplate(defaultTemplate)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          რედაქტირება
                        </Button>
                        <span className="text-xs text-gray-500 self-center">
                          ეს შაბლონი გამოიყენება სატესტო მეილების გაგზავნისთვის
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">ნაგულისხმევი შაბლონი არ არის დაყენებული</span>
                      </div>
                      <p className="text-yellow-700 text-sm mt-1">
                        გთხოვთ, აირჩიოთ ერთ-ერთი შაბლონი და დააყენოთ როგორც ნაგულისხმევი
                      </p>
                    </div>
                  );
                }
              })()}
            </CardContent>
          </Card>
        )}

        {/* Create Template Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>ახალი შაბლონის შექმნა</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: "", subject: "", message: "", isDefault: false });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">შაბლონის სახელი</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="მაგ: მისალმების შაბლონი"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">მეილის თემა</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="მეილის თემა"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">მესიჯი</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="მეილის შინაარსი"
                    rows={6}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="isDefault">ნაგულისხმევი შაბლონი</Label>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={createTemplateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createTemplateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        იქმნება...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        შენახვა
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ name: "", subject: "", message: "", isDefault: false });
                    }}
                  >
                    გაუქმება
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Templates List */}
        <div className="space-y-6">
          {templatesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-20 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {templates.map((template: EmailTemplate) => (
                <Card key={template.id} className="relative">
                  {template.isDefault && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Star className="h-3 w-3 mr-1" />
                        ნაგულისხმევი
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg pr-20">{template.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      შექმნილია: {formatDate(template.createdAt)}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    {editingTemplate?.id === template.id ? (
                      <form onSubmit={handleSubmitEdit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-name-${template.id}`}>სახელი</Label>
                          <Input
                            id={`edit-name-${template.id}`}
                            value={editingTemplate.name}
                            onChange={(e) => setEditingTemplate(prev => 
                              prev ? { ...prev, name: e.target.value } : null
                            )}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`edit-subject-${template.id}`}>თემა</Label>
                          <Input
                            id={`edit-subject-${template.id}`}
                            value={editingTemplate.subject}
                            onChange={(e) => setEditingTemplate(prev => 
                              prev ? { ...prev, subject: e.target.value } : null
                            )}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`edit-message-${template.id}`}>მესიჯი</Label>
                          <Textarea
                            id={`edit-message-${template.id}`}
                            value={editingTemplate.message}
                            onChange={(e) => setEditingTemplate(prev => 
                              prev ? { ...prev, message: e.target.value } : null
                            )}
                            rows={4}
                            required
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`edit-default-${template.id}`}
                            checked={editingTemplate.isDefault}
                            onChange={(e) => setEditingTemplate(prev => 
                              prev ? { ...prev, isDefault: e.target.checked } : null
                            )}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor={`edit-default-${template.id}`}>ნაგულისხმევი</Label>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            size="sm"
                            disabled={updateTemplateMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updateTemplateMutation.isPending ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3 mr-1" />
                            )}
                            შენახვა
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTemplate(null)}
                          >
                            გაუქმება
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">თემა:</p>
                          <p className="text-sm">{template.subject}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600">მესიჯი:</p>
                          <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                            {template.message}
                          </p>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            რედაქტირება
                          </Button>
                          
                          {!template.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(template.id)}
                              disabled={setDefaultMutation.isPending}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              ნაგულისხმევი
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(template.id)}
                            disabled={deleteTemplateMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            წაშლა
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">შაბლონები არ არის</h3>
                <p className="text-gray-500 mb-6">შექმენით თქვენი პირველი მეილის შაბლონი</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  ახალი შაბლონი
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}