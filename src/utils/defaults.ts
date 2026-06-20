import { BusinessSettings, Receipt } from '../types';

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Mi Negocio Comercial',
  phone: '+1 555-0199',
  email: 'contacto@minegocio.com',
  address: 'Av. de la Constitución 45, Local B',
  taxId: 'TX-987654321-A',
  currencySymbol: '$',
  currencyCode: 'USD',
  defaultNotes: '¡Gracias por su compra! Vuelva pronto.',
  defaultTaxRate: 16, // e.g. 16% VAT/IVA
  defaultDiscount: 0,
  receiptPrefix: 'REC-',
  nextReceiptNumber: 101,
};

export const MOCK_RECEIPTS = (settings: BusinessSettings): Receipt[] => [
  {
    id: 'mock-1',
    receiptNumber: `${settings.receiptPrefix}1001`,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
    paymentMethod: 'Efectivo',
    clientName: 'Juan Pérez García',
    clientPhone: '+1 555-3211',
    clientEmail: 'juan.perez@email.com',
    clientTaxId: 'ID-55443322',
    notes: 'Entrega a domicilio completada.',
    items: [
      { id: 'item-1', description: 'Servicio de Consultoría de Negocios', quantity: 2, unitPrice: 120, total: 240 },
      { id: 'item-2', description: 'Manual de Procedimientos PDF', quantity: 1, unitPrice: 35, total: 35 }
    ],
    taxRate: 16,
    discount: 5,
    subtotal: 275,
    discountAmount: 13.75,
    taxAmount: 41.80, // (275 - 13.75) * 0.16 = 41.80
    total: 303.05,
    status: 'paid',
    moneyReceived: 310.00,
    change: 6.95
  },
  {
    id: 'mock-2',
    receiptNumber: `${settings.receiptPrefix}1002`,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    paymentMethod: 'Transferencia Bancaria',
    clientName: 'María Luisa Delgado',
    clientPhone: '+1 555-8899',
    clientEmail: 'maria.delgado@host.com',
    notes: 'Pendiente de confirmación de transferencia interbancaria.',
    items: [
      { id: 'item-3', description: 'Suscripción Semestral Premium', quantity: 1, unitPrice: 150, total: 150 }
    ],
    taxRate: 0,
    discount: 0,
    subtotal: 150,
    discountAmount: 0,
    taxAmount: 0,
    total: 150,
    status: 'pending'
  },
  {
    id: 'mock-3',
    receiptNumber: `${settings.receiptPrefix}1003`,
    date: new Date().toISOString().split('T')[0], // Today
    paymentMethod: 'Tarjeta de Crédito',
    clientName: 'Distribuidora Alimentos S.A.',
    clientTaxId: 'RUT-6789123-K',
    notes: 'Facturado con IVA desglosado.',
    items: [
      { id: 'item-4', description: 'Caja de Suministros de Oficina', quantity: 5, unitPrice: 15.50, total: 77.50 },
      { id: 'item-5', description: 'Servicio de Despacho Express', quantity: 1, unitPrice: 12.00, total: 12.00 }
    ],
    taxRate: 16,
    discount: 0,
    subtotal: 89.50,
    discountAmount: 0,
    taxAmount: 14.32,
    total: 103.82,
    status: 'paid',
    moneyReceived: 103.82,
    change: 0
  }
];
