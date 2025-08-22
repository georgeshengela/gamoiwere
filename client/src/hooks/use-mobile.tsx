import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Define the media query
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    // Set the initial value
    setIsMobile(mediaQuery.matches);
    
    // Define a callback function to handle changes
    const handleResize = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };
    
    // Add the callback function as a listener for changes to the media query
    mediaQuery.addEventListener('change', handleResize);
    
    // Cleanup function to remove the event listener
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []);
  
  return isMobile;
}