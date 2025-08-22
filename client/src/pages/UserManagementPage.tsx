import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Users, Edit, Search, UserCheck, UserX, ArrowLeft, UserPlus, Trash2, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  balance: number | null;
  balance_code: string | null;
  role: string;
  default_address_id: number | null;
  verification_status: string;
  effectiveBalance?: number;
  pendingOrdersAmount?: number;
}

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: number; [key: string]: any }) => {
      return apiRequest(`/api/admin/users/${userData.id}`, {
        method: "PUT",
        data: userData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      toast({
        title: "წარმატება",
        description: "მომხმარებლის მონაცემები წარმატებით განახლდა",
      });
    },
    onError: (error) => {
      toast({
        title: "შეცდომა",
        description: "მომხმარებლის განახლება ვერ მოხერხდა",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "წარმატება",
        description: "მომხმარებელი წარმატებით წაიშალა",
      });
    },
    onError: (error) => {
      toast({
        title: "შეცდომა",
        description: "მომხმარებლის წაშლა ვერ მოხერხდა",
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`დარწმუნებული ხართ, რომ გსურთ მომხმარებელი "${user.username}"-ის წაშლა?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  // Filter users based on search term
  const filteredUsers = users
    .filter((user: User) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a: User, b: User) => {
      // Sort by latest registered (assuming higher ID means more recent)
      return b.id - a.id;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate(editingUser);
  };

  const updateEditingUser = (field: string, value: any) => {
    if (!editingUser) return;
    setEditingUser({ ...editingUser, [field]: value });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header - Mobile Optimized */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <h1 className="font-bold text-gray-900 text-lg sm:text-xl">მომხმარებლები ({Array.isArray(users) ? users.length : 0})</h1>
          </div>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">ადმინ პანელზე დაბრუნება</span>
              <span className="sm:hidden">ადმინი</span>
            </Button>
          </Link>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">ახალი მომხმარებლები პირველ რიგში</p>
      </div>
      {/* Statistics Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">სულ მომხმარებელი</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {Array.isArray(users) ? users.length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">ვერიფიცირებული</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {Array.isArray(users) 
                    ? users.filter((user: User) => user.verification_status === 'verified').length
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">ბოლო რეგისტრირებული</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                  {Array.isArray(users) && users.length > 0 
                    ? users.sort((a: User, b: User) => b.id - a.id)[0]?.username || "-"
                    : "-"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <div className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-600 font-bold text-sm sm:text-base md:text-lg">₾</div>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">მთლიანი ბალანსი</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {(() => {
                    const totalBalance = Array.isArray(users) 
                      ? users.reduce((total: number, user: User) => {
                          const effectiveBalance = user.effectiveBalance !== undefined ? user.effectiveBalance : user.balance ?? 0;
                          return total + effectiveBalance;
                        }, 0)
                      : 0;
                    const formattedBalance = (totalBalance / 100).toFixed(2);
                    return (
                      <span className={totalBalance < 0 ? "text-red-600" : ""}>
                        ₾{formattedBalance}
                      </span>
                    );
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Search - Mobile Optimized */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              placeholder="ძიება..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 text-sm sm:text-base"
            />
          </div>
        </CardContent>
      </Card>
      {/* Users List - Mobile Optimized */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <CardTitle className="text-base sm:text-lg font-medium">
              მომხმარებლები ({filteredUsers.length})
              {totalPages > 1 && (
                <span className="text-xs sm:text-sm text-gray-500 ml-2">
                  • გვერდი {currentPage}/{totalPages}
                </span>
              )}
            </CardTitle>
            <Link href="/admin/users/add">
              <Button className="bg-blue-600 hover:bg-blue-700 h-8 sm:h-9 text-xs sm:text-sm">
                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">ახალი მომხმარებლის დამატება</span>
                <span className="sm:hidden">დამატება</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">იტვირთება...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500">მომხმარებლები ვერ მოიძებნა</div>
            </div>
          ) : (
            <>
              <div className="block sm:hidden">
                {/* Mobile Card View */}
                <div className="space-y-3 p-3">
                  {paginatedUsers.map((user: User) => (
                    <div key={user.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">{user.username}</span>
                        </div>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === "admin" ? "ადმინი" : "მომხმარებელი"}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>ID: {user.id}</div>
                        <div>ელ. ფოსტა: {user.email}</div>
                        {user.full_name && <div>სახელი: {user.full_name}</div>}
                        {user.phone && <div>ტელეფონი: {user.phone}</div>}
                        <div className="flex items-center justify-between">
                          <span>ვერიფიკაცია: {user.verification_status === 'verified' ? 'ვერიფიცირებული' : 'არავერიფიცირებული'}</span>
                          <span>ბალანსი: ₾{((user.effectiveBalance !== undefined ? user.effectiveBalance : user.balance ?? 0) / 100).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="h-7 text-xs flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          რედაქტირება
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="h-7 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          წაშლა
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden sm:block">
                {/* Desktop Table View */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>მომხმარებელი</TableHead>
                      <TableHead>ელ. ფოსტა</TableHead>
                      <TableHead>როლი</TableHead>
                      <TableHead>ვერიფიკაცია</TableHead>
                      <TableHead>ბალანსი</TableHead>
                      <TableHead>ტელეფონი</TableHead>
                      <TableHead className="text-right">მოქმედება</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">{user.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-medium">{user.username}</div>
                              {user.full_name && (
                                <div className="text-sm text-gray-500">{user.full_name}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role === "admin" ? "ადმინი" : "მომხმარებელი"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {user.verification_status === 'verified' ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium">ვერიფიცირებული</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-sm font-medium">არავერიფიცირებული</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className={(user.effectiveBalance !== undefined ? user.effectiveBalance : user.balance ?? 0) < 0 ? "text-red-600 font-medium" : ""}>
                            ₾{(((user.effectiveBalance !== undefined ? user.effectiveBalance : user.balance ?? 0)) / 100).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.phone || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              onClick={() => handleEditUser(user)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              რედაქტირება
                            </Button>
                            <Button
                              onClick={() => handleDeleteUser(user)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              წაშლა
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
          
          {/* Pagination Controls - Mobile Optimized */}
          {filteredUsers.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 border-t">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                ნაჩვენებია {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} {filteredUsers.length}-დან
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  წინა
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  შემდეგი
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>მომხმარებლის რედაქტირება</DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">მომხმარებლის სახელი</Label>
                  <Input
                    id="username"
                    value={editingUser.username}
                    onChange={(e) => updateEditingUser("username", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">ელ.ფოსტა</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => updateEditingUser("email", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full_name">სრული სახელი</Label>
                  <Input
                    id="full_name"
                    value={editingUser.full_name || ""}
                    onChange={(e) => updateEditingUser("full_name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">ტელეფონი</Label>
                  <Input
                    id="phone"
                    value={editingUser.phone || ""}
                    onChange={(e) => updateEditingUser("phone", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="balance">ბალანსი (₾)</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={editingUser.balance || 0}
                    onChange={(e) => updateEditingUser("balance", parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">როლი</Label>
                  <Select 
                    value={editingUser.role} 
                    onValueChange={(value) => updateEditingUser("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">მომხმარებელი</SelectItem>
                      <SelectItem value="admin">ადმინი</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="balance_code">ბალანსის კოდი</Label>
                  <Input
                    id="balance_code"
                    value={editingUser.balance_code || ""}
                    onChange={(e) => updateEditingUser("balance_code", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">მისამართი</Label>
                <Input
                  id="address"
                  value={editingUser.address || ""}
                  onChange={(e) => updateEditingUser("address", e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  გაუქმება
                </Button>
                <Button
                  onClick={handleSaveUser}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "ინახება..." : "შენახვა"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}