import React from 'react';

interface ProductWeightDisplayProps {
  weight: number;
}

const ProductWeightDisplay = ({ weight }: ProductWeightDisplayProps) => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300 relative">
        <div className="absolute inset-0 flex items-center justify-center text-[6px] font-bold text-blue-500">კგ</div>
      </div>
      <span className="text-blue-600 font-medium">წონა: {weight}კგ</span>
    </div>
  );
};

export default ProductWeightDisplay;