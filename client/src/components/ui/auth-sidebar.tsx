import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

interface AuthSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

export function AuthSidebar({ isOpen, onClose, initialView = 'login' }: AuthSidebarProps) {
  const [currentView, setCurrentView] = useState<'login' | 'register'>(initialView);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Handle escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    // Only add listeners if the sidebar is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Reset to initial view when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to avoid flicker during transition
      const timer = setTimeout(() => {
        setCurrentView(initialView);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialView]);
  
  const toggleView = () => {
    setCurrentView(currentView === 'login' ? 'register' : 'login');
  };
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 md:w-[450px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">{currentView === 'login' ? 'სისტემაში შესვლა' : 'რეგისტრაცია'}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Form Container */}
        <div className="px-6 py-8">
          {currentView === 'login' ? (
            <LoginForm 
              isModal={true} 
              onSuccess={onClose} 
              onClose={() => {
                // This is specifically for the "Don't have an account? Register" link
                toggleView();
              }} 
            />
          ) : (
            <RegisterForm 
              isModal={true} 
              onSuccess={onClose} 
              onClose={() => {
                // This is specifically for the "Already have an account? Login" link
                toggleView();
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}