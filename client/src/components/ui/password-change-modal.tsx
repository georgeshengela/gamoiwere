import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { newPassword: string; confirmPassword: string }) => {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'პაროლის შეცვლა ვერ მოხერხდა');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "წარმატება",
        description: "პაროლი წარმატებით შეიცვალა",
      });
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        onClose();
        // Reload page to update user session
        window.location.reload();
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "შეცდომა",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეავსოთ ყველა ველი",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "შეცდომა",
        description: "პაროლები არ ემთხვევა",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "შეცდომა",
        description: "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({ newPassword, confirmPassword });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <DialogTitle className="text-xl font-light">
            პაროლის შეცვლა აუცილებელია
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            უსაფრთხოების მიზნებისდა, გთხოვთ შეცვალოთ თქვენი დროებითი პაროლი
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">ახალი პაროლი</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="ახალი პაროლი"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={changePasswordMutation.isPending}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">პაროლის დადასტურება</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="გაიმეორეთ ახალი პაროლი"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={changePasswordMutation.isPending}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <CheckCircle className="h-4 w-4" />
              <span>პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს</span>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? "იცვლება..." : "პაროლის შეცვლა"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}