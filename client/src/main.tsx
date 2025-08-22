import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { CartProvider } from "@/components/cart/CartContext";

// Suppress console errors for expected 401 authentication failures
const originalConsoleError = console.error;
console.error = (...args) => {
  // Check if this is a 401 authentication error we want to suppress
  const message = args.join(' ');
  if (message.includes('401') && message.includes('/api/auth/user')) {
    return; // Suppress this specific error
  }
  originalConsoleError.apply(console, args);
};

// Create a container that will load the app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create the root instance
const root = createRoot(rootElement);

// Render the app with all providers
root.render(
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <App />
    </CartProvider>
  </QueryClientProvider>
);
