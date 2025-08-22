import mailchimp from '@mailchimp/mailchimp_marketing';

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_KEY?.split('-')[1] || 'us1', // Extract server from API key
});

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
  lastName?: string;
  username: string;
}

export async function sendWelcomeEmail(userData: WelcomeEmailData): Promise<boolean> {
  try {
    if (!process.env.MAILCHIMP_API_KEY) {
      console.error('MAILCHIMP_API_KEY is not configured');
      return false;
    }

    // Get the first audience (mailing list)
    const response = await mailchimp.lists.getAllLists();
    
    if (!response.lists || response.lists.length === 0) {
      console.error('No mailing lists found in Mailchimp account');
      return false;
    }

    const audienceId = response.lists[0].id;

    // Add subscriber to the list
    await mailchimp.lists.addListMember(audienceId, {
      email_address: userData.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: userData.firstName || userData.username,
        LNAME: userData.lastName || '',
      },
      tags: ['website-registration']
    });

    // Send welcome email via automation or campaign
    // Note: This requires setting up an automation in Mailchimp for welcome emails
    console.log(`Successfully added ${userData.email} to Mailchimp audience`);
    return true;

  } catch (error: any) {
    console.error('Mailchimp error:', error.response?.body || error.message);
    return false;
  }
}

export async function subscribeToNewsletter(email: string, firstName?: string, lastName?: string): Promise<boolean> {
  try {
    if (!process.env.MAILCHIMP_API_KEY) {
      console.error('MAILCHIMP_API_KEY is not configured');
      return false;
    }

    const response = await mailchimp.lists.getAllLists();
    
    if (!response.lists || response.lists.length === 0) {
      console.error('No mailing lists found in Mailchimp account');
      return false;
    }

    const audienceId = response.lists[0].id;

    await mailchimp.lists.addListMember(audienceId, {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
        LNAME: lastName || '',
      },
      tags: ['newsletter-subscription']
    });

    console.log(`Successfully subscribed ${email} to newsletter`);
    return true;

  } catch (error: any) {
    console.error('Newsletter subscription error:', error.response?.body || error.message);
    return false;
  }
}

// Test Mailchimp connection
export async function testMailchimpConnection(): Promise<boolean> {
  try {
    if (!process.env.MAILCHIMP_API_KEY) {
      console.error('MAILCHIMP_API_KEY is not configured');
      return false;
    }

    const response = await mailchimp.ping.get();
    console.log('Mailchimp connection successful:', response);
    return true;
  } catch (error: any) {
    console.error('Mailchimp connection failed:', error.response?.body || error.message);
    return false;
  }
}