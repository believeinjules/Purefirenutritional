import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = 'pk_live_51SIBH5H1hhj8gcaIFhWoRBYuoBm1zE9xJlsljbpJfAjo1P6u40Z7PwDdwunwMT4oAGI4KKOBjedXUrRdk3RAILx800gn1ifHXs';

export const stripePromise = loadStripe(stripePublishableKey);

export interface CheckoutItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Create checkout session (this would typically call your backend)
export async function createCheckoutSession(items: CheckoutItem[], customerEmail?: string) {
  // For now, we'll use Stripe's client-side checkout
  // In production, you'd call a Supabase Edge Function or serverless function
  const stripe = await stripePromise;
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  // Format line items for Stripe
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
      },
      unit_amount: Math.round(item.price * 100), // Stripe uses cents
    },
    quantity: item.quantity,
  }));

  return { lineItems, customerEmail };
}
