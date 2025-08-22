import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUsernameValidation, useEmailValidation } from "@/hooks/useValidation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { ButtonLoader } from "@/components/ui/loader";

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
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface RegisterFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

const registerSchema = z.object({
  username: z.string().min(3, {
    message: "მომხმარებლის სახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს",
  }),
  email: z.string().email({
    message: "მიუთითეთ ელ. ფოსტის სწორი მისამართი",
  }),
  phone: z.string().min(9, {
    message: "მიუთითეთ მობილურის ნომერი",
  }).regex(/^[0-9+\-\s()]+$/, {
    message: "მობილურის ნომერი უნდა შეიცავდეს მხოლოდ ციფრებს და სპეციალურ სიმბოლოებს",
  }),
  password: z.string().min(6, {
    message: "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს",
  }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "გთხოვთ დაეთანხმოთ წესებს და პირობებს",
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "პაროლები არ ემთხვევა",
  path: ["confirmPassword"],
});

export function RegisterForm({ onSuccess, onClose, isModal = false }: RegisterFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const { register, registerStatus } = useAuth();
  const isLoading = registerStatus === "pending";
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // Real-time validation hooks
  const username = form.watch("username");
  const email = form.watch("email");
  
  const usernameValidation = useUsernameValidation(username);
  const emailValidation = useEmailValidation(email);

  function onSubmit(values: z.infer<typeof registerSchema>) {
    const { terms, ...registerData } = values;
    
    register(registerData);
    
    // Handle success (close modal or redirect)
    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
    
    if (onClose && registerStatus === "success") {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">რეგისტრაცია</h2>
        <p className="text-sm text-muted-foreground">
          შეავსეთ ფორმა ახალი ანგარიშის შესაქმნელად
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>მომხმარებლის სახელი</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="მომხმარებლის სახელი" 
                      {...field}
                      className={`pr-10 ${
                        username && username.length > 0 
                          ? usernameValidation.hasChecked 
                            ? usernameValidation.available 
                              ? 'border-green-500 focus:border-green-500' 
                              : 'border-red-500 focus:border-red-500'
                            : ''
                          : ''
                      }`}
                      onBlur={() => usernameValidation.checkUsername()}
                    />
                    {username && username.length > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {usernameValidation.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : usernameValidation.hasChecked ? (
                          usernameValidation.available ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        ) : null}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
                {username && username.length > 0 && usernameValidation.hasChecked && usernameValidation.message && (
                  <p className={`text-sm mt-1 ${
                    usernameValidation.available ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {usernameValidation.message}
                  </p>
                )}
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ელ. ფოსტა</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="თქვენი ელ. ფოსტა" 
                      {...field}
                      type="email"
                      className={`pr-10 ${
                        email && email.length > 0 
                          ? emailValidation.hasChecked 
                            ? emailValidation.available 
                              ? 'border-green-500 focus:border-green-500' 
                              : 'border-red-500 focus:border-red-500'
                            : ''
                          : ''
                      }`}
                      onBlur={() => emailValidation.checkEmail()}
                    />
                    {email && email.length > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {emailValidation.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : emailValidation.hasChecked ? (
                          emailValidation.available ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        ) : null}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
                {email && email.length > 0 && emailValidation.hasChecked && emailValidation.message && (
                  <p className={`text-sm mt-1 ${
                    emailValidation.available ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {emailValidation.message}
                  </p>
                )}
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>მობილურის ნომერი</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="მობილურის ნომერი (მაგ: +995555123456)" 
                    {...field}
                    type="tel"
                  />
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
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>გაიმეორეთ პაროლი</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="გაიმეორეთ პაროლი" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm cursor-pointer">
                    ვეთანხმები <Link href="/terms" className="text-primary hover:underline" target="_blank">წესებს და პირობებს</Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <ButtonLoader className="mr-2" />
                მიმდინარეობს...
              </>
            ) : (
              "რეგისტრაცია"
            )}
          </Button>
        </form>
      </Form>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-muted-foreground">ან</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="w-full" type="button">
          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
            <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
            <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
            <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
          </svg>
          Google
        </Button>
        <Button variant="outline" className="w-full" type="button">
          <svg className="mr-2 h-4 w-4" fill="#1877F2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
          </svg>
          Facebook
        </Button>
      </div>
      
      <div className="mt-4 text-center text-sm">
        {isModal ? (
          <button
            type="button"
            className="text-primary hover:text-primary/90 font-medium"
            onClick={onClose}
          >
            უკვე გაქვთ ანგარიში? შედით სისტემაში
          </button>
        ) : (
          <Link href="/login" className="text-primary hover:text-primary/90 font-medium">
            უკვე გაქვთ ანგარიში? შედით სისტემაში
          </Link>
        )}
      </div>
    </div>
  );
}