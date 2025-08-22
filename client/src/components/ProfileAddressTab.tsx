import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Edit, MapPin, Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Simple address tab component that doesn't rely on hooks from the parent component
export const ProfileAddressTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = useState(false);
  const [isEditAddressDialogOpen, setIsEditAddressDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    title: '',
    recipient_name: '',
    recipient_phone: '',
    street_address: '',
    city: '',
    postal_code: '',
    region: '',
    is_default: false
  });
  
  // Fetch addresses from the API
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['/api/user/addresses'],
    queryFn: async () => {
      const response = await fetch('/api/user/addresses');
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      return response.json();
    }
  });
  
  // Set an address as default
  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/user/addresses/${id}/set-default`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to set default address');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/addresses'] });
      toast({
        title: "ძირითადი მისამართი",
        description: "ძირითადი მისამართი წარმატებით დაყენდა",
      });
    }
  });
  
  // Delete an address
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete address');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/addresses'] });
      toast({
        title: "მისამართი წაიშალა",
        description: "მისამართი წარმატებით წაიშალა",
      });
    }
  });
  
  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: async (addressData: Omit<typeof addressForm, 'id'>) => {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });
      
      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.message || 'მისამართის დამატება ვერ მოხერხდა');
        } catch (e) {
          throw new Error('მისამართის დამატება ვერ მოხერხდა - სერვერის შეცდომა');
        }
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/addresses'] });
      setIsAddAddressDialogOpen(false);
      setAddressForm({
        title: '',
        recipient_name: '',
        recipient_phone: '',
        street_address: '',
        city: '',
        postal_code: '',
        region: '',
        is_default: false
      });
      toast({
        title: "მისამართი დამატებულია",
        description: "თქვენი ახალი მისამართი წარმატებით დაემატა",
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
  
  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Omit<typeof addressForm, 'id'> }) => {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'მისამართის განახლება ვერ მოხერხდა');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/addresses'] });
      setIsEditAddressDialogOpen(false);
      setEditingAddressId(null);
      setAddressForm({
        title: '',
        recipient_name: '',
        recipient_phone: '',
        street_address: '',
        city: '',
        postal_code: '',
        region: '',
        is_default: false
      });
      toast({
        title: "მისამართი განახლებულია",
        description: "თქვენი მისამართი წარმატებით განახლდა",
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
  
  // Handle delete button click
  const handleDeleteAddress = (id: number) => {
    if (window.confirm('დარწმუნებული ხართ, რომ გსურთ მისამართის წაშლა?')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Handle edit button click
  const handleEditAddress = (address: any) => {
    setEditingAddressId(address.id);
    setAddressForm({
      title: address.title,
      recipient_name: address.recipient_name,
      recipient_phone: address.recipient_phone,
      street_address: address.street_address,
      city: address.city,
      postal_code: address.postal_code || '',
      region: address.region || '',
      is_default: !!address.is_default
    });
    setIsEditAddressDialogOpen(true);
  };
  
  // Handle form submission
  const handleAddAddress = () => {
    createAddressMutation.mutate(addressForm);
  };
  
  // Handle edit form submission
  const handleUpdateAddress = () => {
    if (editingAddressId) {
      updateAddressMutation.mutate({ 
        id: editingAddressId, 
        data: addressForm 
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">მისამართები</h3>
        <Button onClick={() => setIsAddAddressDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          ახალი მისამართი
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-500">მისამართების ჩატვირთვა...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">მისამართები არ არის დამატებული</p>
          <p className="text-gray-400 text-sm">დააჭირეთ "ახალი მისამართი" ღილაკს მისამართის დასამატებლად</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address: any) => (
            <Card key={address.id} className={`${address.is_default ? 'border-primary' : 'border-gray-200'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-md">{address.title}</CardTitle>
                  {address.is_default && (
                    <span className="bg-primary/10 text-primary text-xs py-1 px-2 rounded-full">
                      ძირითადი
                    </span>
                  )}
                </div>
                <CardDescription className="text-sm">{address.recipient_name}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-1 text-sm">
                  <div>{address.street_address}</div>
                  <div>{address.city}{address.region ? `, ${address.region}` : ''}</div>
                  {address.postal_code && <div>საფოსტო ინდექსი: {address.postal_code}</div>}
                  <div className="font-medium">{address.recipient_phone}</div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between">
                <div>
                  {!address.is_default && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDefaultMutation.mutate(address.id)}
                      disabled={setDefaultMutation.isPending}
                    >
                      ძირითადად დაყენება
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditAddress(address)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Address Dialog */}
      <Dialog open={isAddAddressDialogOpen} onOpenChange={setIsAddAddressDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>ახალი მისამართის დამატება</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">მისამართის სახელი</Label>
              <Input
                id="title"
                placeholder="მაგ.: სახლი, ოფისი"
                value={addressForm.title}
                onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient_name">მიმღების სახელი</Label>
              <Input
                id="recipient_name"
                placeholder="მიმღების სრული სახელი"
                value={addressForm.recipient_name}
                onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient_phone">ტელეფონის ნომერი</Label>
              <Input
                id="recipient_phone"
                placeholder="მიმღების ტელეფონის ნომერი"
                value={addressForm.recipient_phone}
                onChange={(e) => setAddressForm({ ...addressForm, recipient_phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="street_address">ქუჩის მისამართი</Label>
              <Input
                id="street_address"
                placeholder="ქუჩა, ბინა, სართული, და ა.შ."
                value={addressForm.street_address}
                onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">ქალაქი</Label>
                <Input
                  id="city"
                  placeholder="ქალაქი"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postal_code">საფოსტო ინდექსი</Label>
                <Input
                  id="postal_code"
                  placeholder="საფოსტო ინდექსი"
                  value={addressForm.postal_code}
                  onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">რეგიონი</Label>
              <Input
                id="region"
                placeholder="რეგიონი"
                value={addressForm.region}
                onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_default" 
                checked={addressForm.is_default}
                onCheckedChange={(checked) => 
                  setAddressForm({ ...addressForm, is_default: checked as boolean })
                }
              />
              <Label htmlFor="is_default">დააყენეთ ნაგულისხმევ მისამართად</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAddressDialogOpen(false)}>
              გაუქმება
            </Button>
            <Button 
              onClick={handleAddAddress}
              disabled={createAddressMutation.isPending}
            >
              {createAddressMutation.isPending ? (
                <span className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                  ინახება...
                </span>
              ) : (
                "დამატება"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Address Dialog */}
      <Dialog open={isEditAddressDialogOpen} onOpenChange={setIsEditAddressDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>მისამართის რედაქტირება</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">მისამართის სახელი</Label>
              <Input
                id="edit-title"
                placeholder="მაგ.: სახლი, ოფისი"
                value={addressForm.title}
                onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-recipient_name">მიმღების სახელი</Label>
              <Input
                id="edit-recipient_name"
                placeholder="მიმღების სრული სახელი"
                value={addressForm.recipient_name}
                onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-recipient_phone">ტელეფონის ნომერი</Label>
              <Input
                id="edit-recipient_phone"
                placeholder="მიმღების ტელეფონის ნომერი"
                value={addressForm.recipient_phone}
                onChange={(e) => setAddressForm({ ...addressForm, recipient_phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-street_address">ქუჩის მისამართი</Label>
              <Input
                id="edit-street_address"
                placeholder="ქუჩა, ბინა, სართული, და ა.შ."
                value={addressForm.street_address}
                onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-city">ქალაქი</Label>
                <Input
                  id="edit-city"
                  placeholder="ქალაქი"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-postal_code">საფოსტო ინდექსი</Label>
                <Input
                  id="edit-postal_code"
                  placeholder="საფოსტო ინდექსი"
                  value={addressForm.postal_code}
                  onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-region">რეგიონი</Label>
              <Input
                id="edit-region"
                placeholder="რეგიონი"
                value={addressForm.region}
                onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-is_default" 
                checked={addressForm.is_default}
                onCheckedChange={(checked) => 
                  setAddressForm({ ...addressForm, is_default: checked as boolean })
                }
              />
              <Label htmlFor="edit-is_default">დააყენეთ ნაგულისხმევ მისამართად</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAddressDialogOpen(false)}>
              გაუქმება
            </Button>
            <Button 
              onClick={handleUpdateAddress}
              disabled={updateAddressMutation.isPending}
            >
              {updateAddressMutation.isPending ? (
                <span className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                  ინახება...
                </span>
              ) : (
                "განახლება"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileAddressTab;