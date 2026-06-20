export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type ReceiptStatus = 'paid' | 'pending' | 'canceled';

export interface Receipt {
  id: string;
  receiptNumber: string; // e.g., REC-0001
  date: string;
  paymentMethod: string; // e.g., Cash, Card, Bank Transfer, Bizum, etc.
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientTaxId?: string; // e.g. RUT, RFC, NIF, DNI
  notes?: string;
  items: ReceiptItem[];
  taxRate: number; // percentage
  discount: number; // percentage
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: ReceiptStatus;
  moneyReceived?: number;
  change?: number;
}

export interface BusinessSettings {
  businessName: string;
  logoUrl?: string; // Base64 or standard string
  logoFile?: string; // Cache base64 contents
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string; // e.g. NIT, RUT, RFC, CUIT
  currencySymbol: string; // e.g. $, €, S/., Bs.
  currencyCode: string; // e.g. USD, EUR, COP, MXN, PEN
  defaultNotes?: string;
  defaultTaxRate: number;
  defaultDiscount: number;
  receiptPrefix: string;
  nextReceiptNumber: number;
}
