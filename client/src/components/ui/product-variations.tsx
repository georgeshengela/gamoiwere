import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VariationType = "color" | "size" | "storage" | "option";

interface VariationOption {
  id: string;
  name: string;
  value: string;
  available: boolean;
  colorCode?: string; // For color variations
  imageUrl?: string; // For color variations with images
}

interface ProductVariationProps {
  type: VariationType;
  label: string;
  options: VariationOption[];
  selectedOption: string;
  onSelect: (optionId: string) => void;
  required?: boolean;
}

const ProductVariation = ({
  type,
  label,
  options,
  selectedOption,
  onSelect,
  required = true,
}: ProductVariationProps) => {
  const handleSelect = (optionId: string) => {
    if (options.find(opt => opt.id === optionId)?.available) {
      onSelect(optionId);
    }
  };

  const renderColorOption = (option: VariationOption) => (
    <div
      key={option.id}
      className={cn(
        "relative w-12 h-12 rounded-lg cursor-pointer border-2 transition-all flex items-center justify-center overflow-hidden",
        option.available
          ? "hover:scale-105"
          : "opacity-50 cursor-not-allowed",
        selectedOption === option.id
          ? "border-primary ring-2 ring-primary/30"
          : "border-gray-200"
      )}
      onClick={() => handleSelect(option.id)}
      title={option.name}
    >
      {option.imageUrl ? (
        <img 
          src={option.imageUrl} 
          alt={option.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div 
          className="w-full h-full" 
          style={{ backgroundColor: option.colorCode || '#gray' }}
        />
      )}
      {selectedOption === option.id && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>
      )}
      {!option.available && (
        <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center">
          <div className="w-full h-0.5 bg-gray-400 rotate-45 transform-gpu" />
        </div>
      )}
    </div>
  );

  const renderSizeOption = (option: VariationOption) => (
    <Button
      key={option.id}
      variant={selectedOption === option.id ? "default" : "outline"}
      className={cn(
        "min-w-[3rem]",
        option.available
          ? ""
          : "opacity-50 cursor-not-allowed"
      )}
      onClick={() => handleSelect(option.id)}
      disabled={!option.available}
    >
      {option.value}
    </Button>
  );

  const renderStorageOption = (option: VariationOption) => (
    <Button
      key={option.id}
      variant={selectedOption === option.id ? "default" : "outline"}
      className={cn(
        "min-w-[4.5rem]",
        option.available
          ? ""
          : "opacity-50 cursor-not-allowed"
      )}
      onClick={() => handleSelect(option.id)}
      disabled={!option.available}
    >
      {option.value}
    </Button>
  );

  const renderDefaultOption = (option: VariationOption) => (
    <Button
      key={option.id}
      variant={selectedOption === option.id ? "default" : "outline"}
      className={cn(
        option.available
          ? ""
          : "opacity-50 cursor-not-allowed"
      )}
      onClick={() => handleSelect(option.id)}
      disabled={!option.available}
    >
      {option.name}
    </Button>
  );

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <label className="font-medium text-neutral-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {type === "size" && (
          <span className="text-sm text-primary cursor-pointer">ზომების ცხრილი</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          switch (type) {
            case "color":
              return renderColorOption(option);
            case "size":
              return renderSizeOption(option);
            case "storage":
              return renderStorageOption(option);
            default:
              return renderDefaultOption(option);
          }
        })}
      </div>
    </div>
  );
};

export default ProductVariation;