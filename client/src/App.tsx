import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import CategoryPage from "@/pages/CategoryPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import CartPage from "@/pages/CartPage";
import BrandPage from "@/pages/BrandPage";
import ProfilePage from "@/pages/ProfilePage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import CheckoutPage from "@/pages/CheckoutPage";
import SearchResults from "@/pages/SearchResults";
import ImageSearchResults from "@/pages/ImageSearchResults";
import SearchHistory from "@/pages/SearchHistory";
import Wishlist from "@/pages/Wishlist";
import Sitemap from "@/pages/Sitemap";
import AdminPage from "@/pages/AdminPage";
import UserManagementPage from "@/pages/UserManagementPage";
import AddUserPage from "@/pages/AddUserPage";
import TestEmailPage from "@/pages/TestEmailPage";
import EmailTemplatesPage from "@/pages/EmailTemplatesPage";
import SmsNotificationsPage from "@/pages/SmsNotificationsPage";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import AdminOrderDetailPage from "@/pages/AdminOrderDetailPage";
import AdminMonitoringPage from "@/pages/AdminMonitoringPage";
import AdminApiServicePage from "@/pages/AdminApiServicePage";
import SiteStatisticsPage from "@/pages/SiteStatisticsPage";
import CategoryProgressPage from "@/pages/CategoryProgressPage";
import ReturnPolicyPage from "@/pages/ReturnPolicyPage";
import ShippingPage from "@/pages/ShippingPage";
import FAQPage from "@/pages/FAQPage";
import WarrantyPage from "@/pages/WarrantyPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import CareersPage from "@/pages/CareersPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import CookiesPolicyPage from "@/pages/CookiesPolicyPage";
import BlogPage from "@/pages/BlogPage";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentFailed from "@/pages/PaymentFailed";
import NotFound from "@/pages/NotFound";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect, Suspense } from "react";
import { AuthSidebar } from "@/components/ui/auth-sidebar";
import { PageLoader } from "@/components/ui/loader";
import { PasswordChangeModal } from "@/components/ui/password-change-modal";
import { CookieConsent } from "@/components/CookieConsent";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { CartProvider } from "@/components/cart/CartContext";

function App() {
  const [location] = useLocation();
  const [authSidebarOpen, setAuthSidebarOpen] = useState(false);
  const [authSidebarView, setAuthSidebarView] = useState<'login' | 'register'>('login');
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  
  // Initialize Google Analytics
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);
  
  // Use analytics hook to track page views
  useAnalytics();
  
  // Check if we're on a dedicated auth page (for mobile)
  const isAuthPage = location === '/login' || location === '/register' || location === '/forgot-password';
  
  // Close sidebar and scroll to top when navigating
  useEffect(() => {
    setAuthSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  // Listen for password change requirement from login events
  useEffect(() => {
    const handlePasswordChangeRequired = (event: CustomEvent) => {
      setPasswordChangeRequired(event.detail.required);
    };

    window.addEventListener('passwordChangeRequired', handlePasswordChangeRequired as EventListener);
    
    return () => {
      window.removeEventListener('passwordChangeRequired', handlePasswordChangeRequired as EventListener);
    };
  }, []);
  
  // Show AuthSidebar when login/register is clicked (desktop only)
  const handleLoginClick = () => {
    setAuthSidebarView('login');
    setAuthSidebarOpen(true);
  };
  
  const handleRegisterClick = () => {
    setAuthSidebarView('register');
    setAuthSidebarOpen(true);
  };
  
  return (
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <>
          {!isAuthPage && (
            <Header 
              onLoginClick={handleLoginClick} 
              onRegisterClick={handleRegisterClick} 
            />
          )}
          
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/product/:id" component={ProductDetail} />
              <Route path="/category/:id" component={CategoryPage} />
              <Route path="/brand/:brandName" component={BrandPage} />
              <Route path="/cart" component={CartPage} />
              <Route path="/checkout" component={CheckoutPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/orders" component={OrdersPage} />
              <Route path="/orders/:id" component={OrderDetailPage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              <Route path="/forgot-password" component={ForgotPasswordPage} />
              <Route path="/search/:query" component={SearchResults} />
              <Route path="/image-search/:imageUrl" component={ImageSearchResults} />
              <Route path="/search-history" component={SearchHistory} />
              <Route path="/wishlist" component={Wishlist} />
              <Route path="/sitemap" component={Sitemap} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/admin/orders" component={AdminOrdersPage} />
            <Route path="/admin/orders/:id" component={AdminOrderDetailPage} />
              <Route path="/admin/users" component={UserManagementPage} />
              <Route path="/admin/users/add" component={AddUserPage} />
              <Route path="/admin/test-email" component={TestEmailPage} />
              <Route path="/admin/email-templates" component={EmailTemplatesPage} />
              <Route path="/admin/sms-notifications" component={SmsNotificationsPage} />
              <Route path="/admin/monitoring" component={AdminMonitoringPage} />
              <Route path="/admin/api-service" component={AdminApiServicePage} />
              <Route path="/admin/site-statistics" component={SiteStatisticsPage} />
              <Route path="/admin/category-progress" component={CategoryProgressPage} />
              <Route path="/return-policy" component={ReturnPolicyPage} />
              <Route path="/shipping" component={ShippingPage} />
              <Route path="/faq" component={FAQPage} />
              <Route path="/warranty" component={WarrantyPage} />
              <Route path="/about" component={AboutPage} />
              <Route path="/contact" component={ContactPage} />
              <Route path="/careers" component={CareersPage} />
              <Route path="/privacy-policy" component={PrivacyPolicyPage} />
              <Route path="/terms" component={TermsOfServicePage} />
              <Route path="/cookies" component={CookiesPolicyPage} />
              <Route path="/blog" component={BlogPage} />
              <Route path="/payment/success" component={PaymentSuccess} />
              <Route path="/payment-success" component={PaymentSuccessPage} />
              <Route path="/payment/failed" component={PaymentFailed} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
          
          {!isAuthPage && <Footer />}
        </>
        <AuthSidebar 
          isOpen={authSidebarOpen} 
          onClose={() => setAuthSidebarOpen(false)}
          initialView={authSidebarView}
        />
        <PasswordChangeModal 
          isOpen={passwordChangeRequired}
          onClose={() => setPasswordChangeRequired(false)}
        />
        <CookieConsent />
      </TooltipProvider>
    </CartProvider>
  );
}

export default App;
