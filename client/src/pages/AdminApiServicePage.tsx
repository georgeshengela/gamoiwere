import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Search, Shield, Database, ShoppingCart, Package, User, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth?: boolean;
  adminOnly?: boolean;
  params?: string[];
  body?: string;
  response?: string;
  category: 'auth' | 'products' | 'cart' | 'orders' | 'user' | 'admin' | 'categories' | 'search';
}

const apiEndpoints: ApiEndpoint[] = [
  // Authentication Endpoints
  {
    method: 'POST',
    path: '/api/mobile/auth/login',
    description: 'Login user with username/email and password',
    category: 'auth',
    body: '{ "username": "admin", "password": "password123" }',
    response: '{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.token", "user": { "id": 1, "username": "admin", "email": "admin@example.com" } }'
  },
  {
    method: 'POST',
    path: '/api/mobile/auth/register',
    description: 'Register new user account',
    category: 'auth',
    body: '{ "username": "newuser", "email": "user@example.com", "password": "password123", "fullName": "John Doe", "phone": "555123456" }',
    response: '{ "message": "OTP sent", "tempUserId": "temp_12345" }'
  },
  {
    method: 'POST',
    path: '/api/mobile/auth/verify-otp',
    description: 'Verify OTP code for registration',
    category: 'auth',
    body: '{ "tempUserId": "temp_12345", "otp": "123456" }',
    response: '{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mn0.token", "user": { "id": 2, "username": "newuser", "email": "user@example.com" } }'
  },
  {
    method: 'POST',
    path: '/api/mobile/auth/user',
    description: 'Get current user information',
    category: 'auth',
    auth: true,
    response: '{ "id": 1, "username": "admin", "email": "admin@example.com", "fullName": "Admin User", "phone": "555123456", "balance": 1500 }'
  },
  {
    method: 'POST',
    path: '/api/mobile/auth/verify-token',
    description: 'Verify JWT token validity',
    category: 'auth',
    auth: true,
    response: '{ "valid": true, "user": { "id": 1, "username": "admin" } }'
  },

  // Product Endpoints (External API Integration)
  {
    method: 'GET',
    path: '/api/products',
    description: 'Get paginated list of products from Turkish API',
    category: 'products',
    params: ['page', 'limit', 'category', 'search'],
    response: '{ "products": [{"id": "tr-123", "name": "Product Name", "price": 25.99, "images": ["https://cdn.dsmcdn.com/image.jpg"]}], "totalPages": 10, "currentPage": 1 }'
  },
  {
    method: 'GET',
    path: '/api/products/:id',
    description: 'Get single product details from Turkish API by ID',
    category: 'products',
    params: ['id'],
    response: '{ "id": "tr-123", "name": "Product Name", "price": 25.99, "images": ["https://cdn.dsmcdn.com/image.jpg"], "description": "Product description", "brand": "Brand Name" }'
  },
  {
    method: 'GET',
    path: '/api/home/featured',
    description: 'Get featured products for main page first section',
    category: 'products',
    response: '{ "featuredProducts": [{"id": "tr-123", "name": "Featured Product", "price": 35.99, "discount": "15%"}] }'
  },
  {
    method: 'GET',
    path: '/api/home/trending',
    description: 'Get trending products for main page second section',
    category: 'products',
    response: '{ "trendingProducts": [{"id": "tr-456", "name": "Trending Product", "price": 29.99, "oldPrice": 39.99}] }'
  },
  {
    method: 'GET',
    path: '/api/products/similar/:id',
    description: 'Get similar/related products from Turkish API',
    category: 'products',
    params: ['id', 'limit'],
    response: '{ "similarProducts": [{"id": "tr-456", "name": "Similar Product", "price": 28.99, "similarity": 0.85}] }'
  },
  {
    method: 'GET',
    path: '/api/products/brand/:brandName',
    description: 'Get products by brand name from Turkish API',
    category: 'products',
    params: ['brandName', 'page', 'limit'],
    response: '{ "products": [{"id": "tr-789", "name": "Brand Product", "brand": "Nike", "price": 89.99}], "brand": {"name": "Nike", "georgianName": "ნაიკი"}, "totalPages": 8 }'
  },
  {
    method: 'GET',
    path: '/api/products/filters',
    description: 'Get available filters for product search (brands, colors, sizes, price ranges)',
    category: 'products',
    response: '{ "brands": ["Nike", "Adidas"], "colors": ["black", "white", "red"], "sizes": ["S", "M", "L"], "priceRanges": [{"min": 0, "max": 50}, {"min": 50, "max": 100}] }'
  },
  {
    method: 'POST',
    path: '/api/translate-title',
    description: 'Translate Turkish product titles to Georgian using OpenAI',
    category: 'products',
    body: '{ "title": "Kadın Elbise", "targetLanguage": "ka" }',
    response: '{ "translatedTitle": "ქალის კაბა", "cached": false }'
  },

  // Category Endpoints (External API Integration)
  {
    method: 'GET',
    path: '/api/categories',
    description: 'Get hierarchical categories from Turkish API with Georgian translations',
    category: 'categories',
    response: '{ "categories": [{ "id": 1001, "name": "Kadın", "georgianName": "ქალის", "parentId": null, "children": [{"id": 1002, "name": "Elbise", "georgianName": "კაბები"}] }] }'
  },
  {
    method: 'GET',
    path: '/api/categories/:id/products',
    description: 'Get products by category ID from Turkish API',
    category: 'categories',
    params: ['id', 'page', 'limit', 'sort'],
    response: '{ "products": [{"id": "tr-123", "name": "Product", "price": 45.99, "images": ["https://cdn.dsmcdn.com/image.jpg"]}], "category": {"id": 1001, "name": "Kadın", "georgianName": "ქალის"}, "totalPages": 15, "totalProducts": 1847 }'
  },
  {
    method: 'GET',
    path: '/api/categories/tree',
    description: 'Get complete category tree with all nested levels',
    category: 'categories',
    response: '{ "categoryTree": [{"id": 1001, "name": "Kadın", "georgianName": "ქალის", "level": 0, "children": [{"id": 1002, "name": "Elbise", "georgianName": "კაბები"}]}] }'
  },

  // Search Endpoints (External API Integration)
  {
    method: 'GET',
    path: '/api/search',
    description: 'Search products across Turkish API with real-time translation',
    category: 'search',
    params: ['q', 'page', 'limit', 'category', 'minPrice', 'maxPrice', 'sort'],
    response: '{ "products": [{"id": "tr-123", "name": "Search Result", "translatedName": "ძიების შედეგი", "price": 33.50}], "totalResults": 1247, "query": "dress", "translatedQuery": "კაბა", "suggestions": ["evening dress", "summer dress"] }'
  },
  {
    method: 'GET',
    path: '/api/search/suggestions',
    description: 'Get search suggestions and autocomplete',
    category: 'search',
    params: ['q'],
    response: '{ "suggestions": ["dress", "dresses for women", "evening dress"], "translatedSuggestions": ["კაბა", "ქალის კაბები", "საღამოს კაბა"] }'
  },

  // Cart Endpoints
  {
    method: 'GET',
    path: '/api/mobile/cart',
    description: 'Get user cart items',
    category: 'cart',
    auth: true,
    response: '{ "items": [{ "id": 1, "productId": "tr-123", "quantity": 2, "product": {"name": "Product", "price": 25.99} }], "totalAmount": 51.98 }'
  },
  {
    method: 'POST',
    path: '/api/mobile/cart/add',
    description: 'Add item to cart',
    category: 'cart',
    auth: true,
    body: '{ "productId": "tr-123", "quantity": 1 }',
    response: '{ "message": "Item added to cart", "cartItem": {"id": 1, "productId": "tr-123", "quantity": 1} }'
  },
  {
    method: 'PUT',
    path: '/api/mobile/cart/update',
    description: 'Update cart item quantity',
    category: 'cart',
    auth: true,
    body: '{ "cartItemId": 1, "quantity": 3 }',
    response: '{ "message": "Cart updated", "cartItem": {"id": 1, "quantity": 3} }'
  },
  {
    method: 'DELETE',
    path: '/api/mobile/cart/remove/:id',
    description: 'Remove item from cart',
    category: 'cart',
    auth: true,
    params: ['id'],
    response: '{ "message": "Item removed from cart" }'
  },
  {
    method: 'DELETE',
    path: '/api/mobile/cart/clear',
    description: 'Clear all cart items',
    category: 'cart',
    auth: true,
    response: '{ "message": "Cart cleared" }'
  },

  // Order Endpoints
  {
    method: 'GET',
    path: '/api/mobile/orders',
    description: 'Get user orders list',
    category: 'orders',
    auth: true,
    params: ['page', 'limit', 'status'],
    response: '{ "orders": [{"id": 16, "orderNumber": "ORD-20250606-8566", "status": "PENDING", "totalAmount": 5950}], "totalPages": 2, "currentPage": 1 }'
  },
  {
    method: 'GET',
    path: '/api/mobile/orders/:id',
    description: 'Get order details with delivery tracking',
    category: 'orders',
    auth: true,
    params: ['id'],
    response: '{ "order": {"id": 16, "orderNumber": "ORD-20250606-8566", "status": "PENDING"}, "deliveryTracking": {"trackingNumber": "GAM-767549", "status": "DELIVERED_TBILISI"}, "timeline": [{"status": "ORDERED", "date": "2025-06-06"}] }'
  },
  {
    method: 'POST',
    path: '/api/mobile/orders/create',
    description: 'Create new order from cart',
    category: 'orders',
    auth: true,
    body: '{ "shippingAddress": "123 Main St", "paymentMethod": "BANK_TRANSFER", "deliveryMethod": "AIR" }',
    response: '{ "orderId": 17, "orderNumber": "ORD-20250615-1234", "totalAmount": 125.50 }'
  },

  // User Profile Endpoints
  {
    method: 'GET',
    path: '/api/mobile/user/profile',
    description: 'Get user profile information',
    category: 'user',
    auth: true,
    response: '{ "id": 1, "username": "admin", "email": "admin@example.com", "fullName": "Admin User", "phone": "555123456", "address": "123 Main St", "balance": 1500 }'
  },
  {
    method: 'PUT',
    path: '/api/mobile/user/profile',
    description: 'Update user profile',
    category: 'user',
    auth: true,
    body: '{ "fullName": "Updated Name", "phone": "555987654", "address": "456 New St" }',
    response: '{ "message": "Profile updated", "user": {"id": 1, "fullName": "Updated Name", "phone": "555987654"} }'
  },
  {
    method: 'POST',
    path: '/api/mobile/user/change-password',
    description: 'Change user password',
    category: 'user',
    auth: true,
    body: '{ "currentPassword": "oldpassword", "newPassword": "newpassword123" }',
    response: '{ "message": "Password changed successfully" }'
  },

  // Admin Endpoints
  {
    method: 'GET',
    path: '/api/admin/users',
    description: 'Get all users (admin only)',
    category: 'admin',
    auth: true,
    adminOnly: true,
    params: ['page', 'limit', 'search'],
    response: '{ "users": [{"id": 1, "username": "admin", "email": "admin@example.com", "role": "admin"}], "totalPages": 3 }'
  },
  {
    method: 'GET',
    path: '/api/admin/orders',
    description: 'Get all orders (admin only)',
    category: 'admin',
    auth: true,
    adminOnly: true,
    params: ['page', 'limit', 'status'],
    response: '{ "orders": [{"id": 16, "orderNumber": "ORD-20250606-8566", "userId": 3, "status": "PENDING"}], "totalPages": 5 }'
  },
  {
    method: 'PUT',
    path: '/api/admin/orders/:id/status',
    description: 'Update order status (admin only)',
    category: 'admin',
    auth: true,
    adminOnly: true,
    params: ['id'],
    body: '{ "status": "SHIPPED" }',
    response: '{ "message": "Order status updated", "order": {"id": 16, "status": "SHIPPED"} }'
  }
];

const categoryIcons = {
  auth: Shield,
  products: Package,
  categories: Database,
  search: Search,
  cart: ShoppingCart,
  orders: Package,
  user: User,
  admin: Settings
};

const methodColors = {
  GET: 'bg-green-100 text-green-800 border-green-200',
  POST: 'bg-blue-100 text-blue-800 border-blue-200',
  PUT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
  PATCH: 'bg-purple-100 text-purple-800 border-purple-200'
};

export default function AdminApiServicePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const filteredEndpoints = apiEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(apiEndpoints.map(ep => ep.category)));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API endpoint copied to clipboard",
    });
  };

  const renderEndpointCard = (endpoint: ApiEndpoint) => {
    const IconComponent = categoryIcons[endpoint.category];
    
    return (
      <Card key={`${endpoint.method}-${endpoint.path}`} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${methodColors[endpoint.method]} font-mono text-xs`}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                  {endpoint.auth && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Auth Required
                    </Badge>
                  )}
                  {endpoint.adminOnly && (
                    <Badge variant="destructive" className="text-xs">
                      Admin Only
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {endpoint.description}
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(endpoint.path)}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {endpoint.params && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">PARAMETERS</h4>
                <div className="flex flex-wrap gap-1">
                  {endpoint.params.map(param => (
                    <Badge key={param} variant="secondary" className="text-xs">
                      {param}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {endpoint.body && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">REQUEST BODY</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(JSON.parse(endpoint.body), null, 2)}
                </pre>
              </div>
            )}
            
            {endpoint.response && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">RESPONSE</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(JSON.parse(endpoint.response), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Service Documentation</h1>
          <p className="text-muted-foreground">
            Complete API endpoints for mobile application development
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredEndpoints.length} endpoints
        </Badge>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* API Endpoints organized by tabs */}
      <Tabs value={selectedCategory === 'all' ? 'all' : selectedCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>All</TabsTrigger>
          {categories.map(category => {
            const IconComponent = categoryIcons[category];
            return (
              <TabsTrigger 
                key={category} 
                value={category}
                onClick={() => setSelectedCategory(category)}
                className="flex items-center gap-1"
              >
                <IconComponent className="h-3 w-3" />
                <span className="capitalize">{category}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredEndpoints.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No endpoints found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEndpoints.map(renderEndpointCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Base URL Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Base URL Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="font-mono text-sm">Development:</span>
              <code className="text-sm">http://localhost:5000</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted rounded">
              <span className="font-mono text-sm">Production:</span>
              <code className="text-sm">https://your-domain.replit.app</code>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              JWT tokens should be included in the Authorization header as "Bearer {`{token}`}"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}