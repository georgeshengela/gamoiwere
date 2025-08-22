interface SmsData {
  to: string;
  message: string;
}

interface SmsResponse {
  Success: boolean;
  Message: string;
  Output?: any;
  ErrorCode: number;
}

export class SmsService {
  private apiKey = '7c7f081d973c4cbfb7dd5f8b1748fb93';
  private sender = 'GAMOIWERE';
  private baseUrl = 'https://smsoffice.ge/api/v2';

  async sendSms(smsData: SmsData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Format phone number - automatically add 995 if missing
      let formattedPhone = smsData.to.replace(/[\s\-\+]/g, ''); // Remove spaces, dashes, and plus signs
      
      // If phone starts with 00995, remove 00
      if (formattedPhone.startsWith('00995')) {
        formattedPhone = formattedPhone.substring(2);
      }
      // If phone starts with +995, remove +
      else if (formattedPhone.startsWith('+995')) {
        formattedPhone = formattedPhone.substring(1);
      }
      // If phone doesn't start with 995 but is 9 digits (Georgian mobile), add 995
      else if (/^[5-9]\d{8}$/.test(formattedPhone)) {
        formattedPhone = '995' + formattedPhone;
      }
      
      // Validate final phone number format
      const phonePattern = /^995\d{9}$/;
      if (!phonePattern.test(formattedPhone)) {
        throw new Error('არასწორი ნომრის ფორმატი. გამოიყენეთ: 5XXXXXXXX ან 995XXXXXXXXX');
      }

      // Validate message length
      if (smsData.message.length > 1000) {
        throw new Error('შეტყობინება არ უნდა აღემატებოდეს 1000 სიმბოლოს');
      }

      // Prepare URL parameters
      const params = new URLSearchParams({
        key: this.apiKey,
        destination: formattedPhone,
        sender: this.sender,
        content: smsData.message,
        urgent: 'true'
      });

      const url = `${this.baseUrl}/send?${params.toString()}`;

      // Send SMS request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SmsResponse = await response.json();
      
      console.log('SMS API Response:', result);

      if (result.Success) {
        return {
          success: true,
          messageId: result.Output?.messageId || 'SMS_SENT'
        };
      } else {
        return {
          success: false,
          error: this.getErrorMessage(result.ErrorCode) || result.Message
        };
      }

    } catch (error: any) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: `SMS-ის გაგზავნა ვერ მოხერხდა: ${error.message}`
      };
    }
  }

  async checkBalance(): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      const url = `${this.baseUrl.replace('/v2', '')}/getBalance?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const balance = await response.text();
      
      return {
        success: true,
        balance: parseInt(balance) || 0
      };

    } catch (error: any) {
      console.error('Error checking SMS balance:', error);
      return {
        success: false,
        error: `ბალანსის შემოწმება ვერ მოხერხდა: ${error.message}`
      };
    }
  }

  private getErrorMessage(errorCode: number): string {
    const errorMessages: { [key: number]: string } = {
      0: 'მესიჯი მიღებულია გასაგზავნად',
      10: 'destination შეიცავს არაქართულ ნომრებს',
      20: 'ბალანსი არასაკმარისია',
      40: 'გასაგზავნი ტექსტი 160 სიმბოლოზე მეტია',
      60: 'ბრძანებას აკლია content პარამეტრი',
      70: 'ბრძანებას აკლია ნომრები',
      75: 'ყველა ნომერი სტოპ სიაშია',
      76: 'ყველა ნომერი არასწორი ფორმატითაა',
      77: 'ყველა ნომერი სტოპ სიაშია ან არასწორი ფორმატითაა',
      80: 'key-ს შესაბამისი მომხმარებელი ვერ მოიძებნა',
      110: 'sender პარამეტრის მნიშვნელობა გაუგებარია',
      120: 'გააქტიურეთ API-ის გამოყენების უფლება',
      150: 'sender არ იძებნება სისტემაში',
      500: 'ბრძანებას აკლია key პარამეტრი',
      600: 'ბრძანებას აკლია destination პარამეტრი',
      700: 'ბრძანებას აკლია sender პარამეტრი',
      800: 'ბრძანებას აკლია content პარამეტრი',
      [-100]: 'დროებითი შეფერხება'
    };

    return errorMessages[errorCode] || 'უცნობი შეცდომა';
  }
}

export const smsService = new SmsService();