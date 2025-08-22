import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMemo, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Attribute from API
export interface ProductAttribute {
  Pid: string;
  Vid: string;
  PropertyName: string;
  Value: string;
  OriginalPropertyName: string;
  OriginalValue: string;
  IsConfigurator: boolean;
  ImageUrl?: string;
  MiniImageUrl?: string;
  isAvailable?: boolean; // Flag to indicate if this configuration is available (has stock)
}

// Interface for grouped attributes
interface GroupedAttributes {
  [key: string]: {
    propertyName: string;
    values: {
      id: string; // Vid
      value: string;
      selected: boolean;
      imageUrl?: string;
      miniImageUrl?: string;
      available: boolean; // Whether this configuration is available (has stock)
    }[];
  };
}

interface DynamicProductConfiguratorProps {
  attributes: ProductAttribute[];
  selectedAttributes: Record<string, string>;
  onAttributeChange: (propertyId: string, valueId: string) => void;
  className?: string;
}

export function DynamicProductConfigurator({
  attributes,
  selectedAttributes,
  onAttributeChange,
  className,
}: DynamicProductConfiguratorProps) {
  // Only use attributes marked as configurators
  const configuratorAttributes = useMemo(() => {
    return attributes.filter(attr => attr.IsConfigurator);
  }, [attributes]);

  // Group attributes by their property ID (Pid)
  const groupedAttributes = useMemo(() => {
    const grouped: GroupedAttributes = {};
    
    configuratorAttributes.forEach(attr => {
      if (!grouped[attr.Pid]) {
        grouped[attr.Pid] = {
          propertyName: attr.PropertyName,
          values: []
        };
      }
      
      // Check dynamic availability based on current selection
      let isAvailable = attr.isAvailable !== false; // Default availability
      
      // If we have the availability checker function, use it for dynamic checking
      if ((window as any).checkAttributeAvailability) {
        isAvailable = (window as any).checkAttributeAvailability(attr, selectedAttributes);
      }
      
      grouped[attr.Pid].values.push({
        id: attr.Vid,
        value: attr.OriginalValue || attr.Value, // Use OriginalValue when available
        selected: selectedAttributes[attr.Pid] === attr.Vid,
        imageUrl: attr.ImageUrl,
        miniImageUrl: attr.MiniImageUrl,
        available: isAvailable
      });
    });
    
    return grouped;
  }, [configuratorAttributes, selectedAttributes]);

  if (Object.keys(groupedAttributes).length === 0) {
    return null;
  }

  // Check if the property is related to color
  const isColorProperty = (propertyName: string) => {
    return propertyName.toLowerCase().includes('ფერი') || 
           propertyName.toLowerCase().includes('color');
  };

  // Render a color option button
  const renderColorButton = (propertyId: string, value: { id: string; value: string; selected: boolean; imageUrl?: string; miniImageUrl?: string; available: boolean }) => {
    // If we have a miniImageUrl, show image; otherwise show text button
    if (value.miniImageUrl) {
      return (
        <div
          key={value.id}
          className={cn(
            "relative rounded-lg cursor-pointer border transition-all flex items-center justify-center overflow-hidden flex-shrink-0",
            value.available
              ? ""
              : "opacity-50 cursor-not-allowed",
            selectedAttributes[propertyId] === value.id
              ? "border-primary"
              : "border-gray-200"
          )}
          onClick={() => value.available && onAttributeChange(propertyId, value.id)}
          title={value.value}
          style={{ width: '72px', height: '72px' }}
        >
          <img 
            src={value.miniImageUrl} 
            alt={value.value}
            className="w-full h-full object-cover"
          />
          {selectedAttributes[propertyId] === value.id && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
          )}
          {!value.available && (
            <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center">
              <div className="w-full h-0.5 bg-gray-400 rotate-45 transform-gpu" />
            </div>
          )}
        </div>
      );
    }
    
    // Fallback to text button if no image
    return (
      <button
        key={value.id}
        type="button"
        className={`px-3 py-1 text-sm border rounded flex-shrink-0 ${
          selectedAttributes[propertyId] === value.id
            ? 'bg-primary text-white border-primary'
            : 'border-gray-300 hover:border-gray-400'
        } ${!value.available ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => value.available && onAttributeChange(propertyId, value.id)}
        disabled={!value.available}
        title={value.value}
      >
        {value.value}
      </button>
    );
  };

  // Render a size dropdown
  const renderSizeDropdown = (propertyId: string, property: { propertyName: string; values: { id: string; value: string; selected: boolean; available: boolean }[] }) => {
    const selectedValue = property.values.find(v => selectedAttributes[propertyId] === v.id)?.id || "";
    
    // Sort sizes from smallest to biggest
    const sortedValues = [...property.values].sort((a, b) => {
      // Convert size values to numbers for proper sorting
      const getNumericSize = (size: string) => {
        const num = parseFloat(size.replace(/[^\d.]/g, ''));
        return isNaN(num) ? 0 : num;
      };
      
      return getNumericSize(a.value) - getNumericSize(b.value);
    });
    
    return (
      <Select
        key={propertyId}
        value={selectedValue}
        onValueChange={(value) => onAttributeChange(propertyId, value)}
      >
        <SelectTrigger className="w-full h-12 bg-white border border-gray-200 rounded-lg text-left font-light">
          <SelectValue placeholder="აირჩიეთ სასურველი ზომა" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto absolute z-50">
          {sortedValues.map((value) => (
            <SelectItem 
              key={value.id} 
              value={value.id}
              disabled={!value.available}
              className={`font-light ${!value.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
            >
              {value.value}
              {!value.available && (
                <span className="ml-2 text-xs">⛔</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  // Scroll functions for carousel
  const scrollLeft = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: -120, behavior: 'smooth' });
    }
  };

  const scrollRight = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: 120, behavior: 'smooth' });
    }
  };

  // Handle mouse wheel scroll
  const handleWheel = (e: React.WheelEvent, containerId: string) => {
    e.preventDefault();
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    }
  };

  // Check if all variations are standard (სტანდარტული)
  const isStandardOnly = useMemo(() => {
    const allProperties = Object.values(groupedAttributes);
    
    // If there's only one property with one value that contains "სტანდარტული" or similar standard terms
    if (allProperties.length === 1) {
      const property = allProperties[0];
      if (property.values.length === 1) {
        const value = property.values[0].value.toLowerCase();
        return value.includes('სტანდარტული') || 
               value.includes('standard') || 
               value.includes('ჩვეულებრივი') ||
               value.includes('default') ||
               value === 'one size' ||
               value === 'ერთი ზომა';
      }
    }
    
    return false;
  }, [groupedAttributes]);

  // If product has only standard variations, show a clean message
  if (isStandardOnly) {
    const standardProperty = Object.values(groupedAttributes)[0];
    const standardValue = standardProperty.values[0];
    
    // Auto-select the standard option if not already selected
    const propertyId = Object.keys(groupedAttributes)[0];
    if (!selectedAttributes[propertyId]) {
      onAttributeChange(propertyId, standardValue.id);
    }
    
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-green-800 mb-1">
                პროდუქტს ვარიაციები არ აქვს
              </p>
              <p className="text-xs text-green-600">
                სტანდარტული ვარიანტი ავტომატურად არჩეულია
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Object.entries(groupedAttributes).map(([propertyId, property]) => (
        <div key={propertyId} className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="font-medium text-neutral-800">
              {property.propertyName.replace('სხეული', 'ზომა')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            
            {/* Navigation arrows for color carousel */}
            {isColorProperty(property.propertyName) && property.values.length > 6 && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => scrollLeft(`carousel-${propertyId}`)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => scrollRight(`carousel-${propertyId}`)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Carousel container for colors, regular flex wrap for sizes */}
          {isColorProperty(property.propertyName) ? (
            <div className="relative">
              <div 
                id={`carousel-${propertyId}`}
                className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth"
                style={{ 
                  maxWidth: 'calc(13 * (72px + 8px))', // Show ~13 items (72px + 8px gap)
                  width: '100%'
                }}
                onWheel={(e) => handleWheel(e, `carousel-${propertyId}`)}
              >
                {property.values.map((value) => renderColorButton(propertyId, value))}
              </div>
              
              {/* Gradient fade effect on the right */}
              {property.values.length > 13 && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              )}
            </div>
          ) : (
            renderSizeDropdown(propertyId, property)
          )}
        </div>
      ))}
    </div>
  );
}