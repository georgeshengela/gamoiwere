import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface CustomDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export function CustomDropdown({ trigger, children, align = "right" }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Handle escape key to close dropdown
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  // Update position when trigger element changes position
  useEffect(() => {
    if (triggerRef.current && isOpen) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: align === "right" ? rect.right - 224 : rect.left, // 224px is the menu width
        width: 224 // Set fixed width for the dropdown
      });
    }
  }, [isOpen, align]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div ref={triggerRef} onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>
      
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="absolute z-[100] min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md"
          style={{
            position: "absolute",
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}

// Menu item component
export function CustomDropdownItem({ 
  children, 
  onClick,
  icon
}: { 
  children: ReactNode; 
  onClick?: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      className="flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100"
      onClick={onClick}
    >
      {icon && <span className="text-gray-500">{icon}</span>}
      {children}
    </button>
  );
}

// Separator component
export function CustomDropdownSeparator() {
  return <div className="my-1 h-px w-full bg-gray-200" />;
}

// Label component
export function CustomDropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2 py-1.5 text-sm font-semibold">
      {children}
    </div>
  );
}