import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export function Loader({ 
  size = 'medium', 
  fullScreen = false,
  text,
  className
}: LoaderProps) {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4',
  };

  const spinner = (
    <div 
      className={cn(
        "animate-spin rounded-full border-t-transparent border-primary", 
        sizeClasses[size],
        className
      )} 
      role="status" 
      aria-label="loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl flex flex-col items-center">
          {spinner}
          {text && (
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex flex-col items-center">
        {spinner}
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{text}</p>
      </div>
    );
  }

  return spinner;
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700 animate-spin"></div>
          <div 
            className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin" 
            style={{ animationDuration: '1s' }}
          ></div>
        </div>
        <p className="mt-4 text-primary font-medium">იტვირთება...</p>
      </div>
    </div>
  );
}

export function ButtonLoader({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "animate-spin h-4 w-4 border-2 border-t-transparent border-current rounded-full",
        className
      )}
    />
  );
}