import { db } from "./db";
import { and, eq, or, sql } from "drizzle-orm";
import {
  products,
  categories,
  apiCategories,
  sliders,
  cartItems,
  users,
  addresses,
  orders,
  emailLogs,
  emailTemplates,
  payments,
  deliveryMethods,
  searchKeywords,
  favorites,
  translations,
  smsLogs,
  OrderStatus,
  DeliveryMethod,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type ApiCategory,
  type InsertApiCategory,
  type Slider,
  type InsertSlider,
  type CartItem,
  type InsertCartItem,
  type User,
  type InsertUser,
  type Order,
  type InsertOrder,
  type Payment,
  type InsertPayment,
  type Address,
  type InsertAddress,
  type SearchKeyword,
  type InsertSearchKeyword,
  type Favorite,
  type InsertFavorite,
  type Translation,
  type InsertTranslation,
  type EmailLog,
  type InsertEmailLog,
  type EmailTemplate,
  type InsertEmailTemplate,
  type SmsLog,
  type InsertSmsLog,
  type DeliveryMethod as DeliveryMethodType,
  type InsertDeliveryMethod
} from "@shared/schema";

export interface IStorage {
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getPopularProducts(): Promise<Product[]>;
  getRecommendedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // API Category operations
  getAllApiCategories(): Promise<ApiCategory[]>;
  getApiCategoryById(id: number): Promise<ApiCategory | undefined>;
  getApiCategoryByApiId(apiId: number): Promise<ApiCategory | undefined>;
  getApiCategoriesByLevel(level: number): Promise<ApiCategory[]>;
  getApiCategoriesByParentId(parentId: number): Promise<ApiCategory[]>;
  createApiCategory(category: InsertApiCategory): Promise<ApiCategory>;
  updateApiCategory(id: number, categoryData: Partial<ApiCategory>): Promise<ApiCategory>;
  deleteApiCategory(id: number): Promise<boolean>;
  bulkInsertApiCategories(categories: InsertApiCategory[]): Promise<ApiCategory[]>;
  
  // Slider operations
  getAllSliders(): Promise<Slider[]>;
  getSliderById(id: number): Promise<Slider | undefined>;
  createSlider(slider: InsertSlider): Promise<Slider>;
  
  // Cart operations
  getCart(userId: string): Promise<Cart | undefined>;
  addToCart(userId: string, productId: number, quantity: number): Promise<Cart>;
  
  // User operations
  getAllUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined>;
  getUserByBalanceCode(balanceCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  isUsernameTaken(username: string): Promise<boolean>;
  isEmailTaken(email: string): Promise<boolean>;
  
  // Address operations
  getAddressesByUserId(userId: number): Promise<Address[]>;
  getAddressById(id: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, addressData: Partial<Address>): Promise<Address>;
  deleteAddress(id: number): Promise<boolean>;
  setDefaultAddress(userId: number, addressId: number): Promise<boolean>;
  
  // Delivery method operations
  getAllDeliveryMethods(): Promise<DeliveryMethodType[]>;
  getDeliveryMethodByCode(code: keyof typeof DeliveryMethod): Promise<DeliveryMethodType | undefined>;
  createDeliveryMethod(deliveryMethod: InsertDeliveryMethod): Promise<DeliveryMethodType>;
  updateDeliveryMethod(id: number, data: Partial<DeliveryMethodType>): Promise<DeliveryMethodType>;
  
  // Order operations
  getAllOrders(): Promise<Order[]>;
  createOrder(orderData: InsertOrder): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: keyof typeof OrderStatus): Promise<Order>;
  
  // Payment operations
  createPayment(paymentData: InsertPayment): Promise<Payment>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  getPaymentsByOrderId(orderId: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: keyof typeof OrderStatus): Promise<Payment>;
  getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined>;
  
  // Search keyword operations
  getRecentSearchKeywords(limit?: number): Promise<SearchKeyword[]>;
  trackSearch(keyword: string, searchUrl: string): Promise<SearchKeyword>;
  
  // Favorites operations
  getFavoritesByUserId(userId: number): Promise<Favorite[]>;
  addToFavorites(userId: number, productData: Omit<InsertFavorite, 'userId'>): Promise<Favorite>;
  removeFromFavorites(userId: number, productId: string): Promise<boolean>;
  isFavorite(userId: number, productId: string): Promise<boolean>;
  
  // Translation operations
  getTranslation(originalText: string, sourceLanguage?: string, targetLanguage?: string): Promise<Translation | undefined>;
  saveTranslation(translationData: InsertTranslation): Promise<Translation>;
  incrementTranslationUsage(id: number): Promise<Translation>;
  
  // Email log operations
  getAllEmailLogs(): Promise<EmailLog[]>;
  getEmailLogById(id: number): Promise<EmailLog | undefined>;
  createEmailLog(emailLog: InsertEmailLog): Promise<EmailLog>;
  updateEmailLogStatus(id: number, status: string, deliveredAt?: Date, errorMessage?: string): Promise<EmailLog>;
  
  // Email template operations
  getAllEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplateById(id: number): Promise<EmailTemplate | undefined>;
  getDefaultEmailTemplate(): Promise<EmailTemplate | undefined>;
  createEmailTemplate(emailTemplate: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  setDefaultEmailTemplate(id: number): Promise<boolean>;
  getEmailTemplateByName(name: string): Promise<EmailTemplate | undefined>;

  // SMS log operations
  getAllSmsLogs(): Promise<SmsLog[]>;
  getSmsLogById(id: number): Promise<SmsLog | undefined>;
  createSmsLog(smsLog: InsertSmsLog): Promise<SmsLog>;
  updateSmsLogStatus(id: number, status: string, messageId?: string, errorMessage?: string): Promise<SmsLog>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private sliders: Map<number, Slider>;
  private carts: Map<string, Cart>;
  private users: Map<number, User>;
  private orders: Map<number, Order>;
  private payments: Map<number, Payment>;
  private addresses: Map<number, Address>;
  private deliveryMethods: Map<number, DeliveryMethod>;
  private productIdCounter: number;
  private categoryIdCounter: number;
  private sliderIdCounter: number;
  private cartIdCounter: number;
  private userIdCounter: number;
  private orderIdCounter: number;
  private paymentIdCounter: number;
  private addressIdCounter: number;
  private deliveryMethodIdCounter: number;
  
  constructor() {
    this.products = new Map();
    this.categories = new Map();
    this.sliders = new Map();
    this.carts = new Map();
    this.users = new Map();
    this.orders = new Map();
    this.payments = new Map();
    this.addresses = new Map();
    this.productIdCounter = 1;
    this.categoryIdCounter = 1;
    this.sliderIdCounter = 1;
    this.cartIdCounter = 1;
    this.userIdCounter = 1;
    this.orderIdCounter = 1;
    this.paymentIdCounter = 1;
    this.addressIdCounter = 1;
    this.initSampleData();
  }
  
  private initSampleData() {
    // Sample code from original file...
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getPopularProducts(): Promise<Product[]> {
    const popularProducts: Product[] = [];
    for (const product of this.products.values()) {
      if (product.isPopular) {
        popularProducts.push(product);
      }
    }
    return popularProducts;
  }
  
  async getRecommendedProducts(): Promise<Product[]> {
    const recommendedProducts: Product[] = [];
    for (const product of this.products.values()) {
      if (product.isRecommended) {
        recommendedProducts.push(product);
      }
    }
    return recommendedProducts;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = {
      id,
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = {
      id,
      ...category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async getAllSliders(): Promise<Slider[]> {
    return Array.from(this.sliders.values());
  }
  
  async getSliderById(id: number): Promise<Slider | undefined> {
    return this.sliders.get(id);
  }
  
  async createSlider(slider: InsertSlider): Promise<Slider> {
    const id = this.sliderIdCounter++;
    const newSlider: Slider = {
      id,
      ...slider,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.sliders.set(id, newSlider);
    return newSlider;
  }
  
  async getCart(userId: string): Promise<Cart | undefined> {
    for (const cart of this.carts.values()) {
      if (cart.userId === userId) {
        return cart;
      }
    }
    return undefined;
  }
  
  async addToCart(userId: string, productId: number, quantity: number): Promise<Cart> {
    let cart = await this.getCart(userId);
    
    if (!cart) {
      const id = this.cartIdCounter++;
      cart = {
        id,
        userId,
        items: [],
        createdAt: new Date().toISOString()
      };
    }
    
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      const product = await this.getProductById(productId);
      cart.items.push({
        productId,
        quantity,
        name: product?.name || '',
        price: product?.price || 0,
        imageUrl: product?.imageUrl || ''
      });
    }
    
    this.carts.set(cart.id, cart);
    return cart;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }
  
  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
        return user;
      }
    }
    return undefined;
  }
  
  async getUserByBalanceCode(balanceCode: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.balance_code === balanceCode) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      id,
      ...user,
      balance: user.balance || 0,
      balance_code: user.balance_code || null,
      full_name: user.full_name || null,
      phone: user.phone || null,
      address: user.address || null,
      default_address_id: user.default_address_id || null
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = {
      ...user,
      ...userData
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserPassword(id: number, newPassword: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = {
      ...user,
      password: newPassword
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return !!user;
  }
  
  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    return !!user;
  }

  // Address operations
  async getAddressesByUserId(userId: number): Promise<Address[]> {
    const userAddresses: Address[] = [];
    
    for (const address of this.addresses.values()) {
      if (address.user_id === userId) {
        userAddresses.push(address);
      }
    }
    
    // Sort addresses: default addresses first
    return userAddresses.sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return 0;
    });
  }
  
  async getAddressById(id: number): Promise<Address | undefined> {
    return this.addresses.get(id);
  }
  
  async createAddress(address: InsertAddress): Promise<Address> {
    const id = this.addressIdCounter++;
    
    // If this is a default address, update other addresses
    if (address.is_default) {
      for (const [addressId, existingAddress] of this.addresses.entries()) {
        if (existingAddress.user_id === address.user_id && existingAddress.is_default) {
          // Remove default status from other addresses
          this.addresses.set(addressId, {
            ...existingAddress,
            is_default: false
          });
        }
      }
      
      // Update user's default_address_id
      const user = this.users.get(address.user_id);
      if (user) {
        this.users.set(address.user_id, {
          ...user,
          default_address_id: id
        });
      }
    }
    
    const newAddress: Address = {
      id,
      user_id: address.user_id,
      title: address.title,
      recipient_name: address.recipient_name,
      recipient_phone: address.recipient_phone,
      street_address: address.street_address,
      city: address.city,
      postal_code: address.postal_code || null,
      region: address.region || null,
      is_default: address.is_default || false,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    this.addresses.set(id, newAddress);
    return newAddress;
  }
  
  async updateAddress(id: number, addressData: Partial<Address>): Promise<Address> {
    const address = this.addresses.get(id);
    if (!address) {
      throw new Error(`Address with ID ${id} not found`);
    }
    
    // If setting this address as default
    if (addressData.is_default) {
      // Update other addresses for this user
      for (const [addressId, existingAddress] of this.addresses.entries()) {
        if (existingAddress.user_id === address.user_id && 
            existingAddress.id !== id && 
            existingAddress.is_default) {
          // Remove default status from other addresses
          this.addresses.set(addressId, {
            ...existingAddress,
            is_default: false
          });
        }
      }
      
      // Update user's default_address_id
      const user = this.users.get(address.user_id);
      if (user) {
        this.users.set(address.user_id, {
          ...user,
          default_address_id: id
        });
      }
    }
    
    const updatedAddress = {
      ...address,
      ...addressData,
      updated_at: new Date()
    };
    
    this.addresses.set(id, updatedAddress);
    return updatedAddress;
  }
  
  async deleteAddress(id: number): Promise<boolean> {
    const address = this.addresses.get(id);
    if (!address) {
      return false;
    }
    
    // If this was a default address, find another address to make default
    if (address.is_default) {
      // Clear user's default_address_id
      const user = this.users.get(address.user_id);
      if (user) {
        const updatedUser = {
          ...user,
          default_address_id: null
        };
        this.users.set(address.user_id, updatedUser);
      }
      
      // Find another address to make default
      let newDefaultAddress: Address | undefined;
      for (const otherAddress of this.addresses.values()) {
        if (otherAddress.user_id === address.user_id && otherAddress.id !== id) {
          newDefaultAddress = otherAddress;
          break;
        }
      }
      
      if (newDefaultAddress) {
        // Make this the new default address
        this.addresses.set(newDefaultAddress.id, {
          ...newDefaultAddress,
          is_default: true
        });
        
        // Update user's default_address_id
        if (user) {
          this.users.set(address.user_id, {
            ...user,
            default_address_id: newDefaultAddress.id
          });
        }
      }
    }
    
    return this.addresses.delete(id);
  }
  
  async setDefaultAddress(userId: number, addressId: number): Promise<boolean> {
    const address = this.addresses.get(addressId);
    if (!address || address.user_id !== userId) {
      return false;
    }
    
    // Reset all addresses for this user
    for (const [id, existingAddress] of this.addresses.entries()) {
      if (existingAddress.user_id === userId) {
        this.addresses.set(id, {
          ...existingAddress,
          is_default: id === addressId
        });
      }
    }
    
    // Update user's default_address_id
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        default_address_id: addressId
      });
    }
    
    return true;
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    
    const order: Order = {
      id,
      orderNumber: `ORD-${id}-${Math.floor(Math.random() * 10000)}`,
      status: orderData.status || 'PENDING',
      userId: orderData.userId,
      items: orderData.items || [],
      total: orderData.total,
      shippingAddress: orderData.shippingAddress,
      shippingMethod: orderData.shippingMethod,
      shippingCost: orderData.shippingCost || 0,
      tax: orderData.tax || 0,
      discount: orderData.discount || 0,
      notes: orderData.notes || null,
      contactPhone: orderData.contactPhone || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.orders.set(id, order);
    return order;
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    for (const order of this.orders.values()) {
      if (order.orderNumber === orderNumber) {
        return order;
      }
    }
    return undefined;
  }
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const userOrders: Order[] = [];
    for (const order of this.orders.values()) {
      if (order.userId === userId) {
        userOrders.push(order);
      }
    }
    
    // Sort by date (newest first)
    return userOrders.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  async updateOrderStatus(id: number, status: keyof typeof OrderStatus): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    const updatedOrder: Order = {
      ...order,
      status,
      updatedAt: new Date()
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const now = new Date();
    
    const payment: Payment = {
      id,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      method: paymentData.method,
      status: paymentData.status || 'PENDING',
      transactionId: paymentData.transactionId || null,
      payerName: paymentData.payerName || null,
      notes: paymentData.notes || null,
      bankDetails: paymentData.bankDetails || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.payments.set(id, payment);
    return payment;
  }
  
  async getPaymentById(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    const orderPayments: Payment[] = [];
    for (const payment of this.payments.values()) {
      if (payment.orderId === orderId) {
        orderPayments.push(payment);
      }
    }
    return orderPayments;
  }
  
  async updatePaymentStatus(id: number, status: keyof typeof OrderStatus): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    const updatedPayment: Payment = {
      ...payment,
      status,
      updatedAt: new Date()
    };
    
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  async getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined> {
    for (const payment of this.payments.values()) {
      if (payment.transactionId === transactionId) {
        return payment;
      }
    }
    return undefined;
  }
}

export class DatabaseStorage implements IStorage {
  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async getPopularProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isPopular, true));
  }
  
  async getRecommendedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isRecommended, true));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // API Category operations
  async getAllApiCategories(): Promise<ApiCategory[]> {
    return await db.select().from(apiCategories);
  }

  async getApiCategoryById(id: number): Promise<ApiCategory | undefined> {
    const [category] = await db.select().from(apiCategories).where(eq(apiCategories.id, id));
    return category;
  }

  async getApiCategoryByApiId(apiId: number): Promise<ApiCategory | undefined> {
    const [category] = await db.select().from(apiCategories).where(eq(apiCategories.apiId, apiId));
    return category;
  }

  async getApiCategoriesByLevel(level: number): Promise<ApiCategory[]> {
    return await db.select().from(apiCategories).where(eq(apiCategories.level, level));
  }

  async getApiCategoriesByParentId(parentId: number): Promise<ApiCategory[]> {
    return await db.select().from(apiCategories).where(eq(apiCategories.parentId, parentId));
  }

  async createApiCategory(category: InsertApiCategory): Promise<ApiCategory> {
    const [newCategory] = await db.insert(apiCategories).values(category).returning();
    return newCategory;
  }

  async updateApiCategory(id: number, categoryData: Partial<ApiCategory>): Promise<ApiCategory> {
    const [updatedCategory] = await db.update(apiCategories)
      .set(categoryData)
      .where(eq(apiCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteApiCategory(id: number): Promise<boolean> {
    const result = await db.delete(apiCategories).where(eq(apiCategories.id, id));
    return result.rowCount > 0;
  }

  async bulkInsertApiCategories(categories: InsertApiCategory[]): Promise<ApiCategory[]> {
    // Create a map to track API ID to database ID mappings
    const apiIdToDbId = new Map<number, number>();
    
    // Get existing categories to build the mapping
    const existingCategories = await db.select().from(apiCategories);
    existingCategories.forEach(cat => {
      apiIdToDbId.set(cat.apiId, cat.id);
    });
    
    // Process categories and map parent IDs correctly
    const processedCategories = categories.map(cat => {
      let parentId = null;
      if (cat.parentId !== null) {
        const dbParentId = apiIdToDbId.get(cat.parentId);
        if (dbParentId) {
          parentId = dbParentId;
        } else {
          // If parent not found, this category will be skipped or cause error
          throw new Error(`Parent category with API ID ${cat.parentId} not found in database`);
        }
      }
      
      return {
        ...cat,
        parentId
      };
    });
    
    const newCategories = await db.insert(apiCategories).values(processedCategories).returning();
    
    // Update the mapping with newly inserted categories
    newCategories.forEach(cat => {
      apiIdToDbId.set(cat.apiId, cat.id);
    });
    
    return newCategories;
  }
  
  // Slider operations
  async getAllSliders(): Promise<Slider[]> {
    return await db.select().from(sliders);
  }
  
  async getSliderById(id: number): Promise<Slider | undefined> {
    const [slider] = await db.select().from(sliders).where(eq(sliders.id, id));
    return slider;
  }
  
  async createSlider(slider: InsertSlider): Promise<Slider> {
    const [newSlider] = await db.insert(sliders).values(slider).returning();
    return newSlider;
  }
  
  // Cart operations
  async getCart(userId: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    return cart;
  }
  
  async addToCart(userId: string, productId: number, quantity: number): Promise<Cart> {
    const existingCart = await this.getCart(userId);
    
    if (!existingCart) {
      // Create a new cart if one doesn't exist
      const [newCart] = await db.insert(carts).values({
        userId,
        items: [{
          productId,
          quantity,
          name: "",
          price: 0,
          imageUrl: ""
        }],
        createdAt: new Date().toISOString()
      }).returning();
      
      return newCart;
    } else {
      // Update existing cart
      const existingItem = existingCart.items.find(item => item.productId === productId);
      
      let updatedItems;
      if (existingItem) {
        // Increase quantity of existing item
        updatedItems = existingCart.items.map(item => {
          if (item.productId === productId) {
            return { ...item, quantity: item.quantity + quantity };
          }
          return item;
        });
      } else {
        // Add new item
        updatedItems = [...existingCart.items, {
          productId,
          quantity,
          name: "",
          price: 0,
          imageUrl: ""
        }];
      }
      
      const [updatedCart] = await db.update(carts)
        .set({ items: updatedItems })
        .where(eq(carts.userId, userId))
        .returning();
      
      return updatedCart;
    }
  }
  
  // User operations
  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      or(
        eq(users.username, usernameOrEmail),
        eq(users.email, usernameOrEmail)
      )
    );
    return user;
  }
  
  async getUserByBalanceCode(balanceCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.balance_code, balanceCode));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...user,
      role: user.role || 'user' // Default to 'user' role if not specified
    }).returning();
    return newUser;
  }
  
  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return !!user;
  }
  
  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    return !!user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }
  
  async updateUserPassword(id: number, newPassword: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        password: newPassword
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Delete related records first, then the user - simple and reliable approach
      await db.execute(sql`DELETE FROM favorites WHERE user_id = ${id}`);
      await db.execute(sql`DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE user_id = ${id})`);
      await db.execute(sql`DELETE FROM orders WHERE user_id = ${id}`);
      await db.execute(sql`DELETE FROM addresses WHERE user_id = ${id}`);
      
      // Finally delete the user
      const result = await db.execute(sql`DELETE FROM users WHERE id = ${id}`);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  
  // Address operations
  async getAddressesByUserId(userId: number): Promise<Address[]> {
    return await db.select()
      .from(addresses)
      .where(eq(addresses.user_id, userId))
      .orderBy(sql`CASE WHEN ${addresses.is_default} = true THEN 0 ELSE 1 END`);
  }
  
  async getAddressById(id: number): Promise<Address | undefined> {
    const [address] = await db.select()
      .from(addresses)
      .where(eq(addresses.id, id));
    return address;
  }
  
  async createAddress(address: InsertAddress): Promise<Address> {
    // If this is the first address or marked as default, make sure it's set as default
    if (address.is_default) {
      // Reset all other addresses for this user to non-default
      await db.update(addresses)
        .set({ is_default: false })
        .where(eq(addresses.user_id, address.user_id));
      
      // Also update the user's default_address_id field
      // (we'll set it after creating the new address)
    }
    
    const [newAddress] = await db.insert(addresses)
      .values({
        ...address,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    // If this address is default, update the user's default_address_id
    if (newAddress.is_default) {
      await db.update(users)
        .set({ default_address_id: newAddress.id })
        .where(eq(users.id, newAddress.user_id));
    }
    
    return newAddress;
  }
  
  async updateAddress(id: number, addressData: Partial<Address>): Promise<Address> {
    // If setting this address as default
    if (addressData.is_default) {
      const [currentAddress] = await db.select()
        .from(addresses)
        .where(eq(addresses.id, id));
      
      if (currentAddress) {
        // Reset all other addresses for this user to non-default
        await db.update(addresses)
          .set({ is_default: false })
          .where(eq(addresses.user_id, currentAddress.user_id));
        
        // Update the user's default_address_id field
        await db.update(users)
          .set({ default_address_id: id })
          .where(eq(users.id, currentAddress.user_id));
      }
    }
    
    const [updatedAddress] = await db.update(addresses)
      .set({
        ...addressData,
        updated_at: new Date()
      })
      .where(eq(addresses.id, id))
      .returning();
    
    return updatedAddress;
  }
  
  async deleteAddress(id: number): Promise<boolean> {
    // First check if this is a default address
    const [addressToDelete] = await db.select()
      .from(addresses)
      .where(eq(addresses.id, id));
    
    if (!addressToDelete) {
      return false;
    }
    
    // If this is the default address, need to clear the user's default_address_id
    if (addressToDelete.is_default) {
      await db.update(users)
        .set({ default_address_id: null })
        .where(eq(users.id, addressToDelete.user_id));
      
      // Find another address to set as default
      const [nextDefaultAddress] = await db.select()
        .from(addresses)
        .where(and(
          eq(addresses.user_id, addressToDelete.user_id),
          sql`${addresses.id} != ${id}`
        ))
        .limit(1);
      
      if (nextDefaultAddress) {
        // Make this the new default address
        await db.update(addresses)
          .set({ is_default: true })
          .where(eq(addresses.id, nextDefaultAddress.id));
        
        // Update user's default_address_id
        await db.update(users)
          .set({ default_address_id: nextDefaultAddress.id })
          .where(eq(users.id, addressToDelete.user_id));
      }
    }
    
    // Now delete the address
    const result = await db.delete(addresses)
      .where(eq(addresses.id, id));
    
    return !!result;
  }
  
  async setDefaultAddress(userId: number, addressId: number): Promise<boolean> {
    // First verify the address exists and belongs to this user
    const [address] = await db.select()
      .from(addresses)
      .where(and(
        eq(addresses.id, addressId),
        eq(addresses.user_id, userId)
      ));
    
    if (!address) {
      return false;
    }
    
    // Reset all addresses for this user to non-default
    await db.update(addresses)
      .set({ is_default: false })
      .where(eq(addresses.user_id, userId));
    
    // Set the specified address as default
    await db.update(addresses)
      .set({ is_default: true })
      .where(eq(addresses.id, addressId));
    
    // Update the user's default_address_id
    await db.update(users)
      .set({ default_address_id: addressId })
      .where(eq(users.id, userId));
    
    return true;
  }
  
  // Order operations
  async getAllOrders(): Promise<Order[]> {
    const allOrders = await db.select().from(orders);
    return allOrders;
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }
  
  async updateOrderStatus(id: number, status: keyof typeof OrderStatus): Promise<Order> {
    const [updatedOrder] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    
    return updatedOrder;
  }
  
  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }
  
  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }
  
  async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.orderId, orderId));
  }
  
  async updatePaymentStatus(id: number, status: keyof typeof OrderStatus): Promise<Payment> {
    const [updatedPayment] = await db.update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    
    return updatedPayment;
  }
  
  async getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined> {
    try {
      const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.transactionId, transactionId));
        
      return payment;
    } catch (error) {
      console.error("Error in getPaymentByTransactionId:", error);
      return undefined;
    }
  }

  // Search keyword operations
  async getRecentSearchKeywords(limit: number = 10): Promise<SearchKeyword[]> {
    try {
      return await db.select().from(searchKeywords)
        .orderBy(sql`last_searched DESC`)
        .limit(limit);
    } catch (error) {
      console.error("Error in getRecentSearchKeywords:", error);
      return [];
    }
  }

  async trackSearch(keyword: string, searchUrl: string): Promise<SearchKeyword> {
    try {
      // Try to find existing keyword
      const [existing] = await db.select().from(searchKeywords).where(eq(searchKeywords.keyword, keyword));
      
      if (existing) {
        // Update existing keyword
        const [updated] = await db.update(searchKeywords)
          .set({
            searchCount: existing.searchCount + 1,
            lastSearched: new Date(),
            updatedAt: new Date()
          })
          .where(eq(searchKeywords.keyword, keyword))
          .returning();
        return updated;
      } else {
        // Create new keyword
        const [created] = await db.insert(searchKeywords)
          .values({
            keyword,
            searchUrl,
            searchCount: 1,
            firstSearched: new Date(),
            lastSearched: new Date()
          })
          .returning();
        return created;
      }
    } catch (error) {
      console.error("Error in trackSearch:", error);
      throw error;
    }
  }

  // Favorites operations
  async getFavoritesByUserId(userId: number): Promise<Favorite[]> {
    try {
      return await db.select().from(favorites)
        .where(eq(favorites.userId, userId))
        .orderBy(sql`created_at DESC`);
    } catch (error) {
      console.error("Error in getFavoritesByUserId:", error);
      return [];
    }
  }

  async addToFavorites(userId: number, productData: Omit<InsertFavorite, 'userId'>): Promise<Favorite> {
    try {
      const [favorite] = await db.insert(favorites)
        .values({
          userId,
          ...productData
        })
        .returning();
      return favorite;
    } catch (error) {
      console.error("Error in addToFavorites:", error);
      throw error;
    }
  }

  async removeFromFavorites(userId: number, productId: string): Promise<boolean> {
    try {
      const result = await db.delete(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error in removeFromFavorites:", error);
      return false;
    }
  }

  async isFavorite(userId: number, productId: string): Promise<boolean> {
    try {
      const [favorite] = await db.select().from(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
        .limit(1);
      return !!favorite;
    } catch (error) {
      console.error("Error in isFavorite:", error);
      return false;
    }
  }

  // Translation caching methods
  async getTranslation(originalText: string, sourceLanguage: string = "tr", targetLanguage: string = "ka"): Promise<Translation | undefined> {
    try {
      const [translation] = await db.select().from(translations)
        .where(and(
          eq(translations.originalText, originalText),
          eq(translations.sourceLanguage, sourceLanguage),
          eq(translations.targetLanguage, targetLanguage)
        ))
        .limit(1);
      return translation || undefined;
    } catch (error) {
      console.error("Error in getTranslation:", error);
      return undefined;
    }
  }

  async saveTranslation(translationData: InsertTranslation): Promise<Translation> {
    try {
      const [translation] = await db.insert(translations)
        .values(translationData)
        .onConflictDoUpdate({
          target: [translations.originalText, translations.sourceLanguage, translations.targetLanguage],
          set: {
            usageCount: sql`${translations.usageCount} + 1`
          }
        })
        .returning();
      return translation;
    } catch (error) {
      console.error("Error in saveTranslation:", error);
      throw error;
    }
  }

  async incrementTranslationUsage(id: number): Promise<Translation> {
    try {
      const [translation] = await db.update(translations)
        .set({
          usageCount: sql`${translations.usageCount} + 1`
        })
        .where(eq(translations.id, id))
        .returning();
      return translation;
    } catch (error) {
      console.error("Error in incrementTranslationUsage:", error);
      throw error;
    }
  }

  // Email log operations
  async getAllEmailLogs(): Promise<EmailLog[]> {
    try {
      const logs = await db.select().from(emailLogs).orderBy(sql`${emailLogs.sentAt} DESC`);
      return logs;
    } catch (error) {
      console.error("Error fetching email logs:", error);
      throw error;
    }
  }

  async getEmailLogById(id: number): Promise<EmailLog | undefined> {
    try {
      const [log] = await db.select().from(emailLogs).where(eq(emailLogs.id, id));
      return log;
    } catch (error) {
      console.error("Error fetching email log:", error);
      throw error;
    }
  }

  async createEmailLog(emailLogData: InsertEmailLog): Promise<EmailLog> {
    try {
      const [emailLog] = await db
        .insert(emailLogs)
        .values(emailLogData)
        .returning();
      return emailLog;
    } catch (error) {
      console.error("Error creating email log:", error);
      throw error;
    }
  }

  async updateEmailLogStatus(
    id: number, 
    status: string, 
    deliveredAt?: Date, 
    errorMessage?: string
  ): Promise<EmailLog> {
    try {
      const updateData: any = { status };
      if (deliveredAt) updateData.deliveredAt = deliveredAt;
      if (errorMessage) updateData.errorMessage = errorMessage;

      const [emailLog] = await db
        .update(emailLogs)
        .set(updateData)
        .where(eq(emailLogs.id, id))
        .returning();
      return emailLog;
    } catch (error) {
      console.error("Error updating email log status:", error);
      throw error;
    }
  }

  // Email template operations
  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      return await db.select().from(emailTemplates).orderBy(emailTemplates.createdAt);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      throw error;
    }
  }

  async getEmailTemplateById(id: number): Promise<EmailTemplate | undefined> {
    try {
      const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
      return template;
    } catch (error) {
      console.error("Error fetching email template by ID:", error);
      throw error;
    }
  }

  async getDefaultEmailTemplate(): Promise<EmailTemplate | undefined> {
    try {
      const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.isDefault, true));
      return template;
    } catch (error) {
      console.error("Error fetching default email template:", error);
      throw error;
    }
  }

  async createEmailTemplate(templateData: InsertEmailTemplate): Promise<EmailTemplate> {
    try {
      const [template] = await db.insert(emailTemplates).values(templateData).returning();
      return template;
    } catch (error) {
      console.error("Error creating email template:", error);
      throw error;
    }
  }

  async updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    try {
      const [template] = await db
        .update(emailTemplates)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(emailTemplates.id, id))
        .returning();
      return template;
    } catch (error) {
      console.error("Error updating email template:", error);
      throw error;
    }
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    try {
      const result = await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting email template:", error);
      throw error;
    }
  }

  async setDefaultEmailTemplate(id: number): Promise<boolean> {
    try {
      // First, unset all other templates as default
      await db.update(emailTemplates).set({ isDefault: false });
      
      // Then set the specified template as default
      const result = await db
        .update(emailTemplates)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(emailTemplates.id, id));
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error setting default email template:", error);
      throw error;
    }
  }

  async getEmailTemplateByName(name: string): Promise<EmailTemplate | undefined> {
    try {
      const [template] = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.name, name))
        .limit(1);
      return template;
    } catch (error) {
      console.error("Error getting email template by name:", error);
      throw error;
    }
  }

  // SMS log operations
  async getAllSmsLogs(): Promise<SmsLog[]> {
    try {
      const logs = await db
        .select()
        .from(smsLogs)
        .orderBy(sql`${smsLogs.sentAt} DESC`);
      return logs;
    } catch (error) {
      console.error("Error getting SMS logs:", error);
      throw error;
    }
  }

  async getSmsLogById(id: number): Promise<SmsLog | undefined> {
    try {
      const [log] = await db
        .select()
        .from(smsLogs)
        .where(eq(smsLogs.id, id))
        .limit(1);
      return log;
    } catch (error) {
      console.error("Error getting SMS log by id:", error);
      throw error;
    }
  }

  async createSmsLog(smsLog: InsertSmsLog): Promise<SmsLog> {
    try {
      const [log] = await db
        .insert(smsLogs)
        .values(smsLog)
        .returning();
      return log;
    } catch (error) {
      console.error("Error creating SMS log:", error);
      throw error;
    }
  }

  async updateSmsLogStatus(id: number, status: string, messageId?: string, errorMessage?: string): Promise<SmsLog> {
    try {
      const [log] = await db
        .update(smsLogs)
        .set({
          status,
          messageId,
          errorMessage,
        })
        .where(eq(smsLogs.id, id))
        .returning();
      return log;
    } catch (error) {
      console.error("Error updating SMS log status:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();