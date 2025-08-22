import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { ButtonLoader } from "@/components/ui/loader";
import { GoogleLogin } from "@/components/ui/google-login";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface LoginFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, {
    message: "გთხოვთ შეიყვანოთ მომხმარებლის სახელი ან ელ. ფოსტა",
  }),
  password: z.string().min(1, {
    message: "გთხოვთ შეიყვანოთ პაროლი",
  }),
  rememberMe: z.boolean().optional(),
});

export function LoginForm({ onSuccess, onClose, isModal = false }: LoginFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { login, loginStatus } = useAuth();
  const isLoading = loginStatus === "pending";

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      await login(values);
      
      // Handle success (close modal or redirect)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 800);
      }
      
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 800);
      }
      
      // Redirect to home page after successful login
      if (!isModal) {
        setTimeout(() => {
          navigate('/');
        }, 800);
      }
    } catch (error) {
      // Error handling is managed by the useAuth hook
      console.error("Login error:", error);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">შესვლა</h2>
        <p className="text-sm text-muted-foreground">
          შეიყვანეთ თქვენი მომხმარებლის სახელი (ან ელ. ფოსტა) და პაროლი
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="usernameOrEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>მომხმარებლის სახელი ან ელ. ფოსტა</FormLabel>
                <FormControl>
                  <Input placeholder="მომხმარებლის სახელი / ელ. ფოსტა" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>პაროლი</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="პაროლი" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer text-sm">დამიმახსოვრე</FormLabel>
                </FormItem>
              )}
            />
            
            <Link href="/forgot-password" className="text-primary text-sm hover:underline">
              დაგავიწყდათ პაროლი?
            </Link>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <ButtonLoader className="mr-2" />
                შესვლა...
              </>
            ) : (
              "შესვლა"
            )}
          </Button>
        </form>
      </Form>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-muted-foreground">ან</span>
        </div>
      </div>
      
      <GoogleLogin 
        onSuccess={onSuccess}
        onClose={onClose}
        className="mb-4"
      />
      
      <div className="mt-4 text-center text-sm">
        {isModal ? (
          <button
            type="button"
            className="text-primary hover:text-primary/90 font-medium"
            onClick={onClose}
          >
            ჯერ არ გაქვთ ანგარიში? გაიარეთ რეგისტრაცია
          </button>
        ) : (
          <Link href="/register" className="text-primary hover:text-primary/90 font-medium">
            ჯერ არ გაქვთ ანგარიში? გაიარეთ რეგისტრაცია
          </Link>
        )}
      </div>
    </div>
  );
}