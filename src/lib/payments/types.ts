export type BillingPeriod = 'MONTH' | 'YEAR';

export interface CreatePaymentInput {
  userId: string;
  userEmail: string;
  planCode: 'REGULAR' | 'PRO';
  period: BillingPeriod;
  amount: number;
  autoRenew: boolean;
  returnUrl: string;
}

export interface CreatePaymentResult {
  paymentId: string;
  providerPaymentId: string;
  confirmationUrl: string;
  status: 'PENDING' | 'SUCCEEDED' | 'CANCELED';
  receiptUrl?: string;
}

export interface FiscalReceipt {
  customer: {
    email: string;
    phone?: string;
  };
  items: Array<{
    description: string;
    quantity: string;
    amount: {
      value: string;
      currency: string;
    };
    vat_code: number; // 1 = Без НДС (УСН/ПСН), 4 = НДС 20%
    payment_mode: string; // full_payment
    payment_subject: string; // service
  }>;
}

export interface YooKassaWebhookPayload {
  type: string;
  event: 'payment.succeeded' | 'payment.canceled' | 'payment.waiting_for_capture' | string;
  object: {
    id: string;
    status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | string;
    paid: boolean;
    amount: {
      value: string;
      currency: string;
    };
    payment_method?: {
      type: string;
      id: string;
      saved: boolean;
      title?: string;
    };
    metadata?: {
      userId?: string;
      paymentId?: string;
      planCode?: string;
      period?: BillingPeriod;
      autoRenew?: string;
    };
    receipt_registration?: 'pending' | 'succeeded' | 'canceled';
    created_at: string;
  };
}

export interface PaymentProvider {
  name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyWebhook(req: Request, rawBody: string): Promise<boolean>;
  parseWebhook(payload: any): YooKassaWebhookPayload;
}
