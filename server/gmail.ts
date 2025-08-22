import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  message: string;
}

export class GmailService {
  private transporter: any;

  constructor() {
    // Create SMTP transporter using Gmail
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'noreply@gamoiwere.ge',
        pass: process.env.GMAIL_APP_PASSWORD, // App password for Gmail
      },
    });
  }

  async sendTestEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Email options
      const mailOptions = {
        from: '"GAMOIWERE.GE" <noreply@gamoiwere.ge>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.message, // Send the raw template content directly
        text: emailData.message.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text version
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent successfully:', result.messageId);
      return result.messageId || true;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw new Error(`მეილის გაგზავნა ვერ მოხერხდა: ${error.message}`);
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Gmail connection verification failed:', error);
      return false;
    }
  }
}

export const gmailService = new GmailService();