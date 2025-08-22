import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, ArrowLeft, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";

interface NewUser {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
  role: string;
  balance: number;
}

export default function AddUserPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<NewUser>({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    address: "",
    role: "user",
    balance: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: NewUser) => {
      return apiRequest("/api/admin/users/create", {
        method: "POST",
        data: userData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "წარმატება",
        description: "მომხმარებელი წარმატებით დაემატა",
      });
      setLocation("/admin/users");
    },
    onError: (error: any) => {
      toast({
        title: "შეცდომა",
        description: error.message || "მომხმარებლის დამატება ვერ მოხერხდა",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof NewUser, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "მომხმარებლის სახელი აუცილებელია";
    }
    if (!formData.email.trim()) {
      newErrors.email = "ელ. ფოსტა აუცილებელია";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "ელ. ფოსტის ფორმატი არასწორია";
    }
    if (!formData.password.trim()) {
      newErrors.password = "პაროლი აუცილებელია";
    } else if (formData.password.length < 6) {
      newErrors.password = "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createUserMutation.mutate(formData);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              მომხმარებლების სიაში დაბრუნება
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <UserPlus className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">ახალი მომხმარებლის დამატება</h1>
        </div>
        <p className="text-gray-600">შეავსეთ ყველა აუცილებელი ველი ახალი მომხმარებლის შესაქმნელად</p>
      </div>

      {/* Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>მომხმარებლის ინფორმაცია</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">მომხმარებლის სახელი *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="მომხმარებლის სახელი"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">ელ. ფოსტა *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="user@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="password">პაროლი *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="მინიმუმ 6 სიმბოლო"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">სრული სახელი</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="სახელი გვარი"
                />
              </div>

              <div>
                <Label htmlFor="phone">ტელეფონი</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+995 XXX XXX XXX"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">მისამართი</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="სრული მისამართი"
                rows={3}
              />
            </div>

            {/* Account Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">როლი</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ როლი" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">მომხმარებელი</SelectItem>
                    <SelectItem value="admin">ადმინისტრატორი</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="balance">საწყისი ბალანსი (ლარი)</Label>
                <Input
                  id="balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => handleInputChange("balance", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Link href="/admin/users">
                <Button type="button" variant="outline">
                  გაუქმება
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={createUserMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createUserMutation.isPending ? (
                  <>იქმნება...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    მომხმარებლის შექმნა
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}