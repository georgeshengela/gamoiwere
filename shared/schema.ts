import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, index, uuid, foreignKey, unique, uniqueIndex, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalTitle: text("original_title"), // Original Turkish title for translation
  description: text("description"),
  price: integer("price").notNull(), // Price in GEL (tetri)
  oldPrice: integer("old_price"),
  imageUrl: text("image_url").notNull(),
  discountPercentage: integer("discount_percentage"),
  category: text("category").notNull(),
  inStock: boolean("in_stock").default(true),
  featured: boolean("featured").default(false),
  isPopular: boolean("is_popular").default(false),
  isRecommended: boolean("is_recommended").default(false),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  link: text("link").notNull(),
});

// API Categories table for hierarchical category structure from external API
export const apiCategories = pgTable("api_categories", {
  id: serial("id").primaryKey(),
  apiId: text("api_id").notNull().unique(), // Original ID from the API (e.g., "tr-g1")
  name: text("name").notNull(),
  turkishName: text("turkish_name"), // Turkish translation of the category name
  translatedCategories: text("translated_categories"), // AI-optimized e-commerce translation
  parentId: integer("parent_id"), // Self-referencing for hierarchy
  level: integer("level").notNull().default(0), // 0=main, 1=sub, 2=sub-sub
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  parentFK: foreignKey({
    columns: [table.parentId],
    foreignColumns: [table.id],
  }),
  apiIdIdx: index("api_categories_api_id_idx").on(table.apiId),
  parentIdIdx: index("api_categories_parent_id_idx").on(table.parentId),
  levelIdx: index("api_categories_level_idx").on(table.level),
}));

export const sliders = pgTable("sliders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  order: integer("order").default(0),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  variations: jsonb("variations").$type<Record<string, string>>().default({}),
  variationId: text("variation_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userProductIdx: uniqueIndex("user_product_variation_idx").on(table.userId, table.productId, table.variationId),
}));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  full_name: text("full_name"),
  phone: text("phone"),
  address: text("address"), // Keeping for backward compatibility
  balance_code: text("balance_code").unique(),
  balance: integer("balance").default(0),
  pending_transportation_fees: integer("pending_transportation_fees").default(0), // Unpaid transportation costs
  role: text("role").notNull().default("user"),
  verification_status: text("verification_status").notNull().default("unverified"), // verified, unverified
  default_address_id: integer("default_address_id"),
  temp_password: text("temp_password"), // For storing temporary passwords during reset
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(), // e.g. "Home", "Work", "Mom's house"
  recipient_name: text("recipient_name").notNull(),
  recipient_phone: text("recipient_phone").notNull(),
  street_address: text("street_address").notNull(),
  city: text("city").notNull(),
  postal_code: text("postal_code"),
  region: text("region"), // e.g. state, province
  is_default: boolean("is_default").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Session storage table
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => {
  return {
    expireIdx: index("sessions_expire_idx").on(table.expire),
  };
});

// Order status enum
export const OrderStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
} as const;

// Payment method enum
export const PaymentMethod = {
  BANK_TRANSFER: "BANK_TRANSFER",
  BOG: "BOG"
} as const;

// Delivery method enum and pricing
export const DeliveryMethod = {
  AIR: "AIR",         // საჰაერო
  GROUND: "GROUND",   // სახმელეთო
  SEA: "SEA",         // საზღვაო
} as const;

// Delivery method table for storing shipping options
export const deliveryMethods = pgTable("delivery_methods", {
  id: serial("id").primaryKey(),
  code: text("code").$type<keyof typeof DeliveryMethod>().notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  pricePerKg: integer("price_per_kg").notNull(), // Price in GEL (tetri) per kg
  estimatedDaysMin: integer("estimated_days_min").notNull(),
  estimatedDaysMax: integer("estimated_days_max"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table for storing customer orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  items: jsonb("items").notNull().$type<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }[]>(),
  totalAmount: integer("total_amount").notNull(), // Total amount in GEL (tetri)
  status: text("status").$type<keyof typeof OrderStatus>().notNull().default("PENDING"),
  paymentMethod: text("payment_method").$type<keyof typeof PaymentMethod>().notNull().default("BANK_TRANSFER"),
  deliveryMethod: text("delivery_method").$type<keyof typeof DeliveryMethod>(),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  shippingAddress: text("shipping_address"),
  shippingCity: text("shipping_city"),
  shippingPostalCode: text("shipping_postal_code"),
  recipientName: text("recipient_name"),
  recipientPhone: text("recipient_phone"),
  notes: text("notes"),
  // BOG Payment fields
  bogOrderId: text("bog_order_id"), // BOG payment order ID
  externalOrderId: text("external_order_id"), // Our external order ID for BOG
  paymentDetails: jsonb("payment_details"), // Store BOG payment response details
  deliveryAddress: jsonb("delivery_address").$type<{
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }>(), // Store delivery address from payment
  smsNotificationSent: boolean("sms_notification_sent").default(false), // Track if SMS notification has been sent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment table for tracking payment transactions
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  amount: integer("amount").notNull(), // Payment amount in GEL (tetri)
  status: text("status").$type<keyof typeof OrderStatus>().notNull().default("PENDING"),
  method: text("method").$type<keyof typeof PaymentMethod>().notNull().default("BANK_TRANSFER"),
  transactionId: text("transaction_id"), // For bank transfers, this could be a reference number
  payerName: text("payer_name"), // Name of person who made the transfer
  bankDetails: jsonb("bank_details").$type<{
    bankName?: string;
    accountNumber?: string;
    transferDate?: string;
  }>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Search Keywords table for storing user search queries
export const searchKeywords = pgTable("search_keywords", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  searchUrl: text("search_url").notNull(),
  searchCount: integer("search_count").notNull().default(1),
  firstSearched: timestamp("first_searched").defaultNow().notNull(),
  lastSearched: timestamp("last_searched").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  keywordIdx: unique("keyword_idx").on(table.keyword)
}));

// Favorites table for storing user favorite products
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: text("product_id").notNull(),
  productTitle: text("product_title").notNull(),
  productImage: text("product_image"),
  productPrice: integer("product_price"), // Price in tetri
  productUrl: text("product_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userProductIdx: unique("user_product_idx").on(table.userId, table.productId)
}));

// Translation cache table for storing OpenAI translations
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id", { length: 50 }), // Store product ID like tr-881656759
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  sourceLanguage: varchar("source_language", { length: 10 }).notNull().default("tr"), // Turkish
  targetLanguage: varchar("target_language", { length: 10 }).notNull().default("ka"), // Georgian
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usageCount: integer("usage_count").notNull().default(1),
}, (table) => ({
  originalTextIdx: unique("original_text_idx").on(table.originalText, table.sourceLanguage, table.targetLanguage),
  productIdIdx: index("product_id_idx").on(table.productId)
}));

// SMS Logs table
export const smsLogs = pgTable("sms_logs", {
  id: serial("id").primaryKey(),
  recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, sent, failed
  messageId: varchar("message_id", { length: 100 }),
  errorMessage: text("error_message"),
  sentBy: integer("sent_by").references(() => users.id),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// AI Price Analysis cache table
export const priceAnalyses = pgTable("price_analyses", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id", { length: 50 }).notNull().unique(), // Store product ID like tr-881656759
  productTitle: text("product_title").notNull(),
  productPrice: decimal("product_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 5 }).notNull().default("₾"),
  priceRating: integer("price_rating").notNull(), // 1-5 rating
  marketPosition: varchar("market_position", { length: 20 }).notNull(), // good, average, poor
  savings: integer("savings"), // percentage savings
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(), // 0.00-1.00
  insights: jsonb("insights").notNull(), // Array of insight strings
  recommendation: text("recommendation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  usageCount: integer("usage_count").notNull().default(1),
}, (table) => ({
  productIdIdx: index("price_analyses_product_id_idx").on(table.productId),
  priceRatingIdx: index("price_analyses_rating_idx").on(table.priceRating),
  createdAtIdx: index("price_analyses_created_at_idx").on(table.createdAt)
}));

// Insert Schemas
export const insertProductSchema = createInsertSchema(products);
export const insertCategorySchema = createInsertSchema(categories);
export const insertApiCategorySchema = createInsertSchema(apiCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSliderSchema = createInsertSchema(sliders);

export const insertUserSchema = createInsertSchema(users);
export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, created_at: true, updated_at: true });
export const insertDeliveryMethodSchema = createInsertSchema(deliveryMethods).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders, {
  status: z.enum([
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
    OrderStatus.PAID,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED
  ]),
  paymentMethod: z.enum([PaymentMethod.BANK_TRANSFER]),
  deliveryMethod: z.enum([
    DeliveryMethod.AIR,
    DeliveryMethod.GROUND,
    DeliveryMethod.SEA
  ]).optional()
}).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments, {
  method: z.enum([PaymentMethod.BANK_TRANSFER, PaymentMethod.BOG])
}).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSearchKeywordSchema = createInsertSchema(searchKeywords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTranslationSchema = createInsertSchema(translations).omit({ id: true, createdAt: true });
export const insertSmsLogSchema = createInsertSchema(smsLogs).omit({ id: true, sentAt: true });
export const insertPriceAnalysisSchema = createInsertSchema(priceAnalyses).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type ApiCategory = typeof apiCategories.$inferSelect;
export type InsertApiCategory = z.infer<typeof insertApiCategorySchema>;

export type Slider = typeof sliders.$inferSelect;
export type InsertSlider = z.infer<typeof insertSliderSchema>;



export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type DeliveryMethodType = typeof deliveryMethods.$inferSelect;
export type InsertDeliveryMethod = z.infer<typeof insertDeliveryMethodSchema>;

export type SearchKeyword = typeof searchKeywords.$inferSelect;
export type InsertSearchKeyword = z.infer<typeof insertSearchKeywordSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

export type SmsLog = typeof smsLogs.$inferSelect;
export type InsertSmsLog = z.infer<typeof insertSmsLogSchema>;

export type PriceAnalysis = typeof priceAnalyses.$inferSelect;
export type InsertPriceAnalysis = z.infer<typeof insertPriceAnalysisSchema>;

// Email logs table
export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  messageId: varchar("message_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("sent"), // sent, delivered, failed, bounced
  sentBy: integer("sent_by").references(() => users.id),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  sentAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;



// Cart item schemas
export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Notifications table for real-time user notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  orderId: integer("order_id").references(() => orders.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'delivery_update', 'order_status', 'general'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Delivery tracking status enum
export const DeliveryTrackingStatus = {
  ORDERED: "ORDERED",           // პროდუქტი შეკვეთილია
  RECEIVED_CHINA: "RECEIVED_CHINA", // პროდუქტი მიღებულია ჩინეთში
  SENT_TBILISI: "SENT_TBILISI",     // პროდუქტი გაგზავნილია თბილისში
  DELIVERED_TBILISI: "DELIVERED_TBILISI" // პროდუქტი ჩაბარებულია თბილისში
} as const;

// Delivery tracking table for managing shipment details
export const deliveryTracking = pgTable("delivery_tracking", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productWeight: decimal("product_weight", { precision: 8, scale: 2 }), // Weight in kg
  transportationPrice: integer("transportation_price"), // Price in tetri
  trackingNumber: text("tracking_number"),
  deliveryStatus: text("delivery_status").$type<keyof typeof DeliveryTrackingStatus>().notNull().default("ORDERED"),
  orderedAt: timestamp("ordered_at"),
  receivedChinaAt: timestamp("received_china_at"),
  sentTbilisiAt: timestamp("sent_tbilisi_at"),
  deliveredTbilisiAt: timestamp("delivered_tbilisi_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schema for delivery tracking
export const insertDeliveryTrackingSchema = createInsertSchema(deliveryTracking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DeliveryTracking = typeof deliveryTracking.$inferSelect;
export type InsertDeliveryTracking = z.infer<typeof insertDeliveryTrackingSchema>;

// Search suggestions table for intelligent search corrections
export const searchSuggestions = pgTable("search_suggestions", {
  id: serial("id").primaryKey(),
  originalQuery: text("original_query").notNull(),
  suggestedQuery: text("suggested_query").notNull(),
  queryType: text("query_type").notNull(), // 'brand_correction', 'spelling_fix', 'translation'
  confidence: integer("confidence").default(100), // 1-100 confidence score
  language: text("language").notNull(), // 'ka', 'en', 'tr'
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  originalQueryIndex: index("search_suggestions_original_idx").on(table.originalQuery),
  suggestedQueryIndex: index("search_suggestions_suggested_idx").on(table.suggestedQuery),
  typeIndex: index("search_suggestions_type_idx").on(table.queryType),
}));

export const insertSearchSuggestionSchema = createInsertSchema(searchSuggestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SearchSuggestion = typeof searchSuggestions.$inferSelect;
export type InsertSearchSuggestion = z.infer<typeof insertSearchSuggestionSchema>;


