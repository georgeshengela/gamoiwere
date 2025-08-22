import React from "react";
import {
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Watch,
  Gamepad,
  Tablet,
  Camera,
  TagIcon,
  Home,
  Speaker,
  HardDrive,
  Keyboard,
  Monitor,
  Printer,
  MousePointer,
  Gift,
  ShoppingBag,
  Webcam
} from "lucide-react";

export const categoryData = [
  {
    title: "ტელეფონები და აქსესუარები",
    href: "/category/phones",
    items: [
      { 
        title: "მობილური ტელეფონები", 
        href: "/category/phones/mobile",
        children: [
          { title: "iPhone", href: "/category/phones/mobile/iphone" },
          { title: "Samsung", href: "/category/phones/mobile/samsung" },
          { title: "Xiaomi", href: "/category/phones/mobile/xiaomi" },
          { title: "Huawei", href: "/category/phones/mobile/huawei" },
        ]
      },
      { 
        title: "მობილური ტელეფონების აქსესუარები", 
        href: "/category/phones/accessories" 
      },
      { 
        title: "ეკრანის დამცავები", 
        href: "/category/phones/screen-protectors" 
      },
      { 
        title: "ეკრანის დამცავი მინების დამაგრება", 
        href: "/category/phones/installation" 
      },
      { 
        title: "სიმბარათები", 
        href: "/category/phones/sim-cards" 
      },
      { 
        title: "მობილური ტელეფონების სერვისები", 
        href: "/category/phones/services" 
      },
      { 
        title: "კასტომიზაცია", 
        href: "/category/phones/customization" 
      },
      { 
        title: "გარანტიები", 
        href: "/category/phones/warranty" 
      }
    ]
  },
  {
    title: "საყოფაცხოვრებო",
    href: "/category/home",
    items: [
      { 
        title: "სარეცხი მანქანები", 
        href: "/category/home/washing-machines" 
      },
      { 
        title: "მაცივრები", 
        href: "/category/home/fridges" 
      },
      { 
        title: "ჭურჭლის სარეცხი მანქანები", 
        href: "/category/home/dishwashers" 
      },
      { 
        title: "საყინულეები და მცირე ტექნიკა", 
        href: "/category/home/freezers" 
      },
      { 
        title: "ქურები", 
        href: "/category/home/cookers" 
      },
      { 
        title: "გამწოვები", 
        href: "/category/home/hoods" 
      },
      { 
        title: "დაინსტალაცია", 
        href: "/category/home/installation" 
      }
    ]
  },
  {
    title: "კომპიუტერული ტექნიკა",
    href: "/category/computers",
    items: [
      { 
        title: "ლეპტოპები", 
        href: "/category/computers/laptops",
        children: [
          { title: "Apple", href: "/category/computers/laptops/apple" },
          { title: "Lenovo", href: "/category/computers/laptops/lenovo" },
          { title: "HP", href: "/category/computers/laptops/hp" },
          { title: "Dell", href: "/category/computers/laptops/dell" },
          { title: "Asus", href: "/category/computers/laptops/asus" },
        ]
      },
      { 
        title: "დესკტოპები", 
        href: "/category/computers/desktops" 
      },
      { 
        title: "TV ადაპტერები", 
        href: "/category/computers/tv-adapters" 
      },
      { 
        title: "სამონტაჟო დეტალები", 
        href: "/category/computers/mounting" 
      },
      { 
        title: "კომპონენტები და მცირე დეტალები", 
        href: "/category/computers/components" 
      }
    ]
  },
  {
    title: "გართობისთვის ტექნიკა",
    href: "/category/entertainment",
    items: [
      { 
        title: "კონსოლები", 
        href: "/category/entertainment/consoles" 
      },
      { 
        title: "რინგტოუნები", 
        href: "/category/entertainment/ringtones" 
      },
      { 
        title: "აქსესუარები კონსოლებისთვის", 
        href: "/category/entertainment/console-accessories" 
      },
      { 
        title: "თამაშები კონსოლებისთვის", 
        href: "/category/entertainment/games" 
      },
      { 
        title: "VIP გართობისთვის მოწყობილობა", 
        href: "/category/entertainment/vip" 
      }
    ]
  },
  {
    title: "აუდიო ტექნიკა",
    href: "/category/audio",
    items: [
      { 
        title: "ყურსასმენები", 
        href: "/category/audio/headphones",
        children: [
          { title: "უსადენო ყურსასმენები", href: "/category/audio/headphones/wireless" },
          { title: "სადენიანი ყურსასმენები", href: "/category/audio/headphones/wired" },
          { title: "სპორტული ყურსასმენები", href: "/category/audio/headphones/sports" },
          { title: "ნოისქენსელებიანი ყურსასმენები", href: "/category/audio/headphones/noise-cancelling" },
        ]
      },
      { 
        title: "დინამიკები", 
        href: "/category/audio/speakers" 
      },
      { 
        title: "გარემენტები", 
        href: "/category/audio/sound-systems" 
      },
      { 
        title: "მიკროფონები", 
        href: "/category/audio/microphones" 
      },
      { 
        title: "აუდიო ადაპტერები", 
        href: "/category/audio/adapters" 
      }
    ]
  },
  {
    title: "ქსელური ტექნიკა",
    href: "/category/network",
    items: [
      { 
        title: "როუტერები და მოდემები", 
        href: "/category/network/routers" 
      },
      { 
        title: "ქსელური ადაპტერები", 
        href: "/category/network/adapters" 
      },
      { 
        title: "უსაფრთხოების სისტემები", 
        href: "/category/network/security" 
      },
      { 
        title: "ქსელური კაბელები", 
        href: "/category/network/cables" 
      },
      { 
        title: "სასერვერო აღჭურვილობა", 
        href: "/category/network/server" 
      }
    ]
  },
  {
    title: "მეხსიერების საშუალებები",
    href: "/category/storage",
    items: [
      { 
        title: "მეხსიერების ბარათები და სადენები", 
        href: "/category/storage/memory-cards" 
      },
      { 
        title: "ფლეშმეხსიერება", 
        href: "/category/storage/flash-drives" 
      },
      { 
        title: "ღრუბლოვანი სერვისები", 
        href: "/category/storage/cloud" 
      },
      { 
        title: "მყარი და ფლეშ დისკები", 
        href: "/category/storage/hard-drives" 
      },
      { 
        title: "სარეზერვო კოპირება", 
        href: "/category/storage/backup" 
      }
    ]
  },
  {
    title: "ქვეყნის ხედვა",
    href: "/category/vision",
    items: [
      { 
        title: "ციფრული ხელსაწყოები", 
        href: "/category/vision/digital-tools" 
      },
      { 
        title: "სმარტრელური ხელსაწყოები", 
        href: "/category/vision/smart-tools" 
      },
      { 
        title: "საავტომობილო ტექნიკა", 
        href: "/category/vision/automotive" 
      },
      { 
        title: "ფოტო-ვიდეო ტექნიკა", 
        href: "/category/vision/photo" 
      },
      { 
        title: "სხვა ტექნიკური საშუალებები", 
        href: "/category/vision/others" 
      }
    ]
  }
];

// Helper function to get the icon for a category
export const getCategoryIcon = (categorySlug: string) => {
  switch (categorySlug) {
    case "phones":
      return <Smartphone className="h-4 w-4" />;
    case "computers":
      return <Laptop className="h-4 w-4" />;
    case "audio":
      return <Headphones className="h-4 w-4" />;
    case "entertainment":
      return <Gamepad className="h-4 w-4" />;
    case "home":
      return <Home className="h-4 w-4" />;
    case "network":
      return <Monitor className="h-4 w-4" />;
    case "storage":
      return <HardDrive className="h-4 w-4" />;
    case "vision":
      return <Camera className="h-4 w-4" />;
    default:
      return <TagIcon className="h-4 w-4" />;
  }
};