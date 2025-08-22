import { storage } from './storage';
import { gmailService } from './gmail';
import type { Order, User } from '@shared/schema';

interface OrderEmailData {
  username: string;
  email: string;
  order_number: string;
  status_text: string;
  status_class: string;
  order_date: string;
  delivery_address: string;
  payment_method: string;
  products_list: string;
  subtotal: string;
  delivery_cost: string;
  total_amount: string;
}

export class OrderEmailService {
  private getStatusText(status: string): { text: string; class: string } {
    const statusMap = {
      'PENDING': { text: 'მუშავდება', class: 'pending' },
      'PROCESSING': { text: 'მზადდება', class: 'processing' },
      'PAID': { text: 'გადახდილია', class: 'paid' },
      'SHIPPED': { text: 'გაგზავნილია', class: 'shipped' },
      'DELIVERED': { text: 'მიწოდებულია', class: 'delivered' },
      'CANCELLED': { text: 'გაუქმებულია', class: 'pending' }
    };
    return statusMap[status as keyof typeof statusMap] || { text: 'მუშავდება', class: 'pending' };
  }

  private getPaymentMethodText(method: string): string {
    const methodMap = {
      'BANK_TRANSFER': 'საბანკო გადარიცხვა',
      'BALANCE': 'ბალანსიდან',
      'CASH': 'ნაღდი ანგარიშსწორება',
      'CARD': 'ბარათით'
    };
    return methodMap[method as keyof typeof methodMap] || method;
  }

  private generateProductsList(items: any[]): string {
    return items.map(item => `
      <div class="product-item">
        <div class="product-info">
          <div class="product-name">${item.name}</div>
          <div class="product-details">რაოდენობა: ${item.quantity} ცალი</div>
        </div>
        <div class="product-price">${item.price} ₾</div>
      </div>
    `).join('');
  }

  private replaceTemplateVariables(template: string, data: OrderEmailData): string {
    return template
      .replace(/\{\{username\}\}/g, data.username)
      .replace(/\{\{order_number\}\}/g, data.order_number)
      .replace(/\{\{status_text\}\}/g, data.status_text)
      .replace(/\{\{status_class\}\}/g, data.status_class)
      .replace(/\{\{order_date\}\}/g, data.order_date)
      .replace(/\{\{delivery_address\}\}/g, data.delivery_address)
      .replace(/\{\{payment_method\}\}/g, data.payment_method)
      .replace(/\{\{products_list\}\}/g, data.products_list)
      .replace(/\{\{subtotal\}\}/g, data.subtotal)
      .replace(/\{\{delivery_cost\}\}/g, data.delivery_cost)
      .replace(/\{\{total_amount\}\}/g, data.total_amount);
  }

  async sendOrderConfirmationEmail(order: Order, user: User): Promise<boolean> {
    try {
      // Get the order confirmation email template
      const orderTemplate = await storage.getEmailTemplateByName('შეკვეთის დადასტურება');
      
      if (!orderTemplate) {
        console.error('Order confirmation email template not found');
        return false;
      }

      // Get status text and class
      const statusInfo = this.getStatusText(order.status);

      // Calculate totals
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryCost = 0; // No separate delivery cost field in current schema
      const totalAmount = order.totalAmount / 100; // Convert from tetri to GEL

      // Generate products list HTML
      const productsListHtml = this.generateProductsList(order.items);

      // Prepare order data for template replacement
      const orderData: OrderEmailData = {
        username: user.username,
        email: user.email,
        order_number: order.orderNumber,
        status_text: statusInfo.text,
        status_class: statusInfo.class,
        order_date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('ka-GE') : new Date().toLocaleDateString('ka-GE'),
        delivery_address: order.shippingAddress || 'მისამართი მითითებული არ არის',
        payment_method: this.getPaymentMethodText(order.paymentMethod || 'BANK_TRANSFER'),
        products_list: productsListHtml,
        subtotal: subtotal.toFixed(2),
        delivery_cost: deliveryCost.toFixed(2),
        total_amount: totalAmount.toFixed(2)
      };

      // Replace template variables
      const personalizedSubject = this.replaceTemplateVariables(orderTemplate.subject, orderData);
      const personalizedMessage = this.replaceTemplateVariables(orderTemplate.message, orderData);

      // Send the email
      const emailSent = await gmailService.sendTestEmail({
        to: user.email,
        subject: personalizedSubject,
        message: personalizedMessage
      });

      if (emailSent) {
        // Log the email
        await storage.createEmailLog({
          recipientEmail: user.email,
          subject: personalizedSubject,
          message: personalizedMessage,
          status: 'sent'
        });
        
        console.log(`Order confirmation email sent successfully to ${user.email} for order ${order.orderNumber}`);
        return true;
      } else {
        // Log the failed email
        await storage.createEmailLog({
          recipientEmail: user.email,
          subject: personalizedSubject,
          message: personalizedMessage,
          status: 'failed',
          errorMessage: 'Failed to send email'
        });
        
        console.error(`Failed to send order confirmation email to ${user.email} for order ${order.orderNumber}`);
        return false;
      }
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      
      // Log the error
      try {
        await storage.createEmailLog({
          recipientEmail: user.email,
          subject: `შეკვეთა #${order.orderNumber} - GAMOIWERE.GE`,
          message: 'Order confirmation email template',
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (logError) {
        console.error('Failed to log email error:', logError);
      }
      
      return false;
    }
  }
}

export const orderEmailService = new OrderEmailService();