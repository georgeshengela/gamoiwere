import { storage } from './storage';
import { gmailService } from './gmail';
import type { User } from '@shared/schema';

interface WelcomeEmailData {
  username: string;
  email: string;
  balance_code: string;
  balance: number;
  full_name?: string;
}

export class WelcomeEmailService {
  private replaceTemplateVariables(template: string, userData: WelcomeEmailData): string {
    return template
      .replace(/\{\{username\}\}/g, userData.username)
      .replace(/\{\{email\}\}/g, userData.email)
      .replace(/\{\{balance_code\}\}/g, userData.balance_code)
      .replace(/\{\{balance\}\}/g, userData.balance.toString())
      .replace(/\{\{full_name\}\}/g, userData.full_name || userData.username);
  }

  async sendWelcomeEmail(user: User): Promise<boolean> {
    try {
      // Get the welcome email template
      const welcomeTemplate = await storage.getEmailTemplateByName('კეთილი იყოს თქვენი მობრძანება');
      
      if (!welcomeTemplate) {
        console.error('Welcome email template not found');
        return false;
      }

      // Prepare user data for template replacement
      const userData: WelcomeEmailData = {
        username: user.username,
        email: user.email,
        balance_code: user.balance_code || '',
        balance: user.balance || 0,
        full_name: user.full_name || undefined
      };

      // Replace template variables
      const personalizedSubject = this.replaceTemplateVariables(welcomeTemplate.subject, userData);
      const personalizedMessage = this.replaceTemplateVariables(welcomeTemplate.message, userData);

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
        
        console.log(`Welcome email sent successfully to ${user.email}`);
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
        
        console.error(`Failed to send welcome email to ${user.email}`);
        return false;
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      
      // Log the error
      try {
        await storage.createEmailLog({
          recipientEmail: user.email,
          subject: 'კეთილი იყოს თქვენი მობრძანება GAMOIWERE.GE-ზე!',
          message: 'Welcome email template',
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

export const welcomeEmailService = new WelcomeEmailService();