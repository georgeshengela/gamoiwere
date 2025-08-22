import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეიყვანოთ ელ-ფოსტა",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the email to your server
    toast({
      title: "წარმატება!",
      description: "თქვენ წარმატებით გამოიწერეთ სიახლეები",
    });
    setEmail("");
  };

  return (
    <section className="bg-primary rounded-lg p-8 mb-12">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <h2 className="text-white text-2xl font-bold mb-2 caps">
            გამოიწერეთ სიახლეები
          </h2>
          <p className="text-white/80">
            მიიღეთ ინფორმაცია ახალი პროდუქტებისა და აქციების შესახებ
          </p>
        </div>
        <div className="w-full md:w-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row">
            <Input
              type="email"
              placeholder="თქვენი ელ.ფოსტა"
              className="px-4 py-3 rounded-lg sm:rounded-r-none w-full sm:w-64 mb-2 sm:mb-0 focus:outline-none text-black bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              className="bg-white text-primary px-6 py-3 rounded-lg sm:rounded-l-none font-medium hover:bg-neutral-100 transition-colors"
            >
              გამოწერა
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
