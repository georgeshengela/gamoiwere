import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Phone } from "lucide-react";

interface QuickOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productId: number;
  price: number;
}

const QuickOrderModal = ({ 
  open, 
  onOpenChange, 
  productName, 
  productId, 
  price 
}: QuickOrderModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "თბილისი",
    comments: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "შეკვეთა მიღებულია",
        description: "ჩვენი ოპერატორი დაგიკავშირდებათ უახლოეს დროში",
      });
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: "",
        phone: "",
        address: "",
        city: "თბილისი",
        comments: "",
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>სწრაფი შეკვეთა</DialogTitle>
          <DialogDescription>
            შეავსეთ ფორმა და ჩვენი ოპერატორი დაგიკავშირდებათ უახლოეს დროში
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 mb-4">
            <div className="p-4 bg-neutral-50 rounded-md text-sm">
              <p className="font-medium mb-1">{productName}</p>
              <p>პროდუქტის კოდი: {productId}</p>
              <p className="text-lg font-bold mt-2">₾{price.toFixed(2)}</p>
            </div>
          </div>
          
          <Tabs defaultValue="delivery" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="delivery">მიტანით</TabsTrigger>
              <TabsTrigger value="pickup">მაღაზიიდან გატანა</TabsTrigger>
            </TabsList>
            
            <TabsContent value="delivery" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">სახელი და გვარი *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="მიუთითეთ სახელი და გვარი"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">ტელეფონის ნომერი *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="მიუთითეთ ტელეფონის ნომერი"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">ქალაქი *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="მიუთითეთ ქალაქი"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">მისამართი *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="მიუთითეთ მისამართი"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comments">კომენტარი</Label>
                <Input
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  placeholder="დამატებითი ინფორმაცია შეკვეთისთვის"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="pickup" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name-pickup">სახელი და გვარი *</Label>
                  <Input
                    id="name-pickup"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="მიუთითეთ სახელი და გვარი"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone-pickup">ტელეფონის ნომერი *</Label>
                  <Input
                    id="phone-pickup"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="მიუთითეთ ტელეფონის ნომერი"
                    required
                  />
                </div>
              </div>
              
              <div className="p-4 border border-dashed border-gray-300 rounded-md">
                <div className="flex items-start mb-3">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Phone className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">თბილისის მაღაზია</h4>
                    <p className="text-sm text-gray-500">თბილისი, ჭავჭავაძის 10</p>
                    <p className="text-sm text-gray-500">10:00 - 20:00 (ორშ-პარ)</p>
                    <p className="text-sm text-gray-500">11:00 - 19:00 (შაბ-კვ)</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comments-pickup">კომენტარი</Label>
                <Input
                  id="comments-pickup"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  placeholder="დამატებითი ინფორმაცია შეკვეთისთვის"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-4">
              ღილაკზე დაჭერით თქვენ ეთანხმებით ჩვენს{" "}
              <a href="/terms" className="text-primary">წესებსა და პირობებს</a>
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              გაუქმება
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "გთხოვთ მოიცადოთ..." : "შეკვეთის განთავსება"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickOrderModal;