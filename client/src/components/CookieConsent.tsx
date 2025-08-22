import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show modal after a short delay
      setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 100);
      }, 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    hideModal();
    onAccept?.();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    hideModal();
    onDecline?.();
  };

  const hideModal = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-t-2xl shadow-2xl max-w-md w-full mx-4 mb-0 pointer-events-auto transform transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={hideModal}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6 pt-8">
          {/* Cookie Icon and Title */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#6e39ea]/10 p-3 rounded-full mr-3">
              <Cookie className="w-8 h-8 text-[#6e39ea]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Cookie ფაილებზე წვდომა
            </h3>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            Cookie ფაილებს ვიყენებთ ვებგვერდის სწორად ფუნქციონირებისა და შენი გამოცდილების გაუმჯობესებისთვის
          </p>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              უარყოფა
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 bg-[#6e39ea] hover:bg-[#5d2bc7] text-white shadow-lg"
            >
              მიღება
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}