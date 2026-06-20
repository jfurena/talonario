import React, { useState, useEffect } from 'react';
import { Receipt, ReceiptItem, BusinessSettings, ReceiptStatus } from '../types';
import { Plus, Trash2, Save, Sparkles, User, ShoppingBag, CreditCard } from 'lucide-react';

interface ReceiptFormProps {
  settings: BusinessSettings;
  savedReceipts: Receipt[];
  onSave: (receipt: Receipt) => void;
  editingReceipt?: Receipt | null;
  onCancelEdit?: () => void;
  onThemeChange?: (theme: 'classic' | 'ticket' | 'elegant') => void;
  currentTheme: 'classic' | 'ticket' | 'elegant';
}

const COMMON_CONCEPTS = [
  { desc: 'Venta de productos/mercadería', price: 50 },
  { desc: 'Servicio técnico a domicilio', price: 80 },
  { desc: 'Consultoría / Asesoramiento', price: 100 },
  { desc: 'Mantenimiento preventivo', price: 60 },
  { desc: 'Gastos de envío / Entrega', price: 15 },
  { desc: 'Suscripción mensual de servicio', price: 29.99 },
];

export default function ReceiptForm({
  settings,
  savedReceipts,
  onSave,
  editingReceipt,
  onCancelEdit,
  onThemeChange,
  currentTheme,
}: ReceiptFormProps) {
  // Form fields
  const [receiptNumber, setReceiptNumber] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [status, setStatus] = useState<ReceiptStatus>('paid');
  
  // Client States
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientTaxId, setClientTaxId] = useState('');
  const [notes, setNotes] = useState('');

  // Items table
  const [items, setItems] = useState<ReceiptItem[]>([]);
  
  // Tax / Discount sliders
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);

  // New item inputs
  const [newDesc, setNewDesc] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(0);

  // Cash payment inputs
  const [moneyReceived, setMoneyReceived] = useState<string>('');

  // Initialize values
  useEffect(() => {
    if (editingReceipt) {
      // Load current editing values
      setReceiptNumber(editingReceipt.receiptNumber);
      setDate(editingReceipt.date);
      setPaymentMethod(editingReceipt.paymentMethod);
      setStatus(editingReceipt.status);
      setClientName(editingReceipt.clientName);
      setClientPhone(editingReceipt.clientPhone || '');
      setClientEmail(editingReceipt.clientEmail || '');
      setClientAddress(editingReceipt.clientAddress || '');
      setClientTaxId(editingReceipt.clientTaxId || '');
      setNotes(editingReceipt.notes || '');
      setItems(editingReceipt.items);
      setTaxRate(editingReceipt.taxRate);
      setDiscount(editingReceipt.discount);
      setMoneyReceived(editingReceipt.moneyReceived ? editingReceipt.moneyReceived.toString() : '');
    } else {
      // Load new defaults from settings
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Efectivo');
      setStatus('paid');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setClientAddress('');
      setClientTaxId('');
      setNotes(settings.defaultNotes || '');
      setItems([]);
      setTaxRate(settings.defaultTaxRate);
      setDiscount(settings.defaultDiscount);
      setMoneyReceived('');
      
      // Calculate next invoice code
      setReceiptNumber(`${settings.receiptPrefix}${settings.nextReceiptNumber}`);
    }
  }, [editingReceipt, settings]);

  // Sync calculations preview live
  const calculatedSums = React.useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const discountAmount = Number(((subtotal * discount) / 100).toFixed(2));
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = Number(((subtotalAfterDiscount * taxRate) / 100).toFixed(2));
    const total = Number((subtotalAfterDiscount + taxAmount).toFixed(2));
    
    const cashVal = moneyReceived ? parseFloat(moneyReceived) : 0;
    const change = cashVal > total ? Number((cashVal - total).toFixed(2)) : 0;

    return { subtotal, discountAmount, taxAmount, total, change };
  }, [items, discount, taxRate, moneyReceived]);

  // Extract recurring customers to click and fill instantly
  const recurringCustomers = React.useMemo(() => {
    const customersMap = new Map<string, typeof clientName>();
    const detailsMap = new Map<string, { phone?: string; email?: string; address?: string; taxId?: string }>();
    
    savedReceipts.forEach((r) => {
      if (r.clientName && r.clientName.trim()) {
        const cleanName = r.clientName.trim();
        customersMap.set(cleanName.toLowerCase(), cleanName);
        if (!detailsMap.has(cleanName.toLowerCase())) {
          detailsMap.set(cleanName.toLowerCase(), {
            phone: r.clientPhone,
            email: r.clientEmail,
            address: r.clientAddress,
            taxId: r.clientTaxId,
          });
        }
      }
    });

    return Array.from(customersMap.keys()).map((key) => {
      const details = detailsMap.get(key);
      return {
        name: customersMap.get(key)!,
        ...details,
      };
    }).slice(0, 4); // limit to 4 suggestions
  }, [savedReceipts]);

  // Handler: fill in values instantly
  const handleAutofillCustomer = (customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxId?: string;
  }) => {
    setClientName(customer.name);
    setClientPhone(customer.phone || '');
    setClientEmail(customer.email || '');
    setClientAddress(customer.address || '');
    setClientTaxId(customer.taxId || '');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) {
      alert('Por favor ingresa una descripción para el concepto.');
      return;
    }
    if (newQty <= 0) {
      alert('La cantidad debe ser mayor que cero.');
      return;
    }

    const newItem: ReceiptItem = {
      id: 'item-' + Date.now(),
      description: newDesc.trim(),
      quantity: Number(newQty),
      unitPrice: Number(newPrice),
      total: Number((newQty * newPrice).toFixed(2)),
    };

    setItems([...items, newItem]);
    
    // Reset fields for next input
    setNewDesc('');
    setNewQty(1);
    setNewPrice(0);
  };

  // Helper preset insert
  const applyPresetConcept = (concept: typeof COMMON_CONCEPTS[0]) => {
    const presetItem: ReceiptItem = {
      id: 'item-' + Date.now(),
      description: concept.desc,
      quantity: 1,
      unitPrice: concept.price,
      total: concept.price,
    };
    setItems([...items, presetItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSaveReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim()) {
      alert('Por favor, ingresa el nombre de tu cliente.');
      return;
    }

    if (items.length === 0) {
      alert('Debes agregar por lo menos un concepto o artículo para procesar el recibo.');
      return;
    }

    const { subtotal, discountAmount, taxAmount, total, change } = calculatedSums;

    const receiptData: Receipt = {
      id: editingReceipt ? editingReceipt.id : 'rec-' + Date.now(),
      receiptNumber: receiptNumber || `REC-${Date.now()}`,
      date,
      paymentMethod,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      clientAddress: clientAddress.trim() || undefined,
      clientTaxId: clientTaxId.trim() || undefined,
      notes: notes.trim() || undefined,
      items,
      taxRate: Number(taxRate),
      discount: Number(discount),
      subtotal,
      taxAmount,
      discountAmount,
      total,
      status: status,
      moneyReceived: moneyReceived ? parseFloat(moneyReceived) : undefined,
      change: moneyReceived ? change : undefined,
    };

    onSave(receiptData);
  };

  return (
    <form onSubmit={handleSaveReceipt} className="space-y-6">
      
      {/* Receipt Visual Theme Picker */}
      <div className="bg-[#FAF9F6] p-5 rounded-3xl border border-earth-border shadow-xs flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-[#7A7A6A] block">
            Estilo de Impresión del Recibo
          </label>
          <span className="text-[10px] text-earth-primary font-bold bg-[#EAE7DF] border border-earth-border px-2 py-0.5 rounded-full">3 Estilos de Papel</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'classic', label: 'Azul Clásico', desc: 'Sello y diseño tradicional' },
            { id: 'ticket', label: 'Ticket Térmico', desc: 'Monocromo, letra mono' },
            { id: 'elegant', label: 'Moderno Elegante', desc: 'Líneas limpias, color' },
          ].map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => onThemeChange?.(theme.id as any)}
              className={`text-left p-3 rounded-2xl border transition duration-150 cursor-pointer ${
                currentTheme === theme.id
                  ? 'border-earth-primary bg-[#EAE7DF] shadow-xs'
                  : 'border-earth-border-light hover:border-[#7A7A6A] bg-white'
              }`}
            >
              <div className="font-extrabold text-earth-text text-xs">{theme.label}</div>
              <div className="text-[10px] text-earth-secondary mt-0.5 leading-tight">{theme.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 1. Basic Info Details */}
      <div className="bg-[#FAF9F6] p-6 rounded-3xl border border-earth-border shadow-xs">
        <h3 className="text-md font-serif italic text-earth-primary mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-earth-accent-bg rounded-full flex items-center justify-center text-earth-primary font-serif font-bold italic text-xs leading-none">1</span>
          Detalles de Emisión
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Folio / Número Recibo</label>
            <input
              type="text"
              required
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="e.g. REC-101"
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Fecha</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Estado de Pago</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReceiptStatus)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text cursor-pointer"
            >
              <option value="paid">🟢 PAGADO (Entregado)</option>
              <option value="pending">🟡 Pendiente / Por cobrar</option>
              <option value="canceled">⚪ Cancelado / Anulado</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Customer Section */}
      <div className="bg-[#FAF9F6] p-6 rounded-3xl border border-earth-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-md font-serif italic text-earth-primary flex items-center gap-2">
            <span className="w-6 h-6 bg-earth-accent-bg rounded-full flex items-center justify-center text-earth-primary font-serif font-bold italic text-xs leading-none">2</span>
            Datos del Cliente
          </h3>
          
          {/* Autofill options */}
          {recurringCustomers.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[#7A7A6A] mr-1 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-earth-primary" /> Historial rápido:
              </span>
              {recurringCustomers.map((cust, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAutofillCustomer(cust)}
                  className="text-[10px] bg-white hover:bg-earth-accent-bg border border-earth-border-light rounded-full px-2.5 py-0.5 text-earth-text font-medium transition cursor-pointer"
                >
                  {cust.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Nombre Completo o Empresa*</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5"><User className="w-4 h-4 text-[#7A7A6A]" /></span>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Juan Pérez o Distribuidora S.A."
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Identificación Fiscal (RUT/DNI/RFC)</label>
            <input
              type="text"
              value={clientTaxId}
              onChange={(e) => setClientTaxId(e.target.value)}
              placeholder="e.g. RUT 12.345.678-K"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Teléfono</label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="e.g. +56 9 8765 4321"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Dirección del Cliente</label>
            <input
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Calle Falsa 123, Depto 4B"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="cliente@correo.com"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>
        </div>
      </div>

      {/* 3. Concepts / Items Table */}
      <div className="bg-[#FAF9F6] p-6 rounded-3xl border border-earth-border shadow-xs space-y-4">
        <h3 className="text-md font-serif italic text-earth-primary flex items-center gap-2">
          <span className="w-6 h-6 bg-earth-accent-bg rounded-full flex items-center justify-center text-earth-primary font-serif font-bold italic text-xs leading-none">3</span>
          Items o Conceptos del Recibo
        </h3>

        {/* Input Add Panel */}
        <div className="p-4 bg-white border border-earth-border-light rounded-2xl space-y-3">
          <p className="text-[10px] font-bold text-[#7A7A6A] uppercase tracking-widest">Añadir Concepto</p>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-6">
              <label className="block text-[10px] text-earth-secondary mb-1">Descripción del concepto</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. Abono mensual de soporte técnico"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-[#F5F5F0]/50 focus:border-earth-primary outline-none text-earth-text"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[10px] text-earth-secondary mb-1">Cantidad</label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={newQty}
                onChange={(e) => setNewQty(parseFloat(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-[#F5F5F0]/50 focus:border-earth-primary cursor-pointer outline-none text-earth-text"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] text-earth-secondary mb-1">Precio Unitario ({settings.currencySymbol})</label>
              <input
                type="number"
                min="0"
                step="any"
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-[#F5F5F0]/50 focus:border-earth-primary cursor-pointer outline-none text-earth-text"
              />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="md:col-span-2 py-2.5 bg-earth-primary hover:bg-[#4A4A32] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Añadir
            </button>
          </div>

          {/* Quick presets tags */}
          <div className="pt-2 border-t border-earth-border-light">
            <p className="text-[10px] font-bold text-[#7A7A6A] mb-1.5 uppercase tracking-wider">Añadir Concepto Rápido:</p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CONCEPTS.map((concept, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPresetConcept(concept)}
                  className="text-[10px] bg-[#FAF9F6] border border-earth-border hover:bg-earth-accent-bg text-earth-primary px-2.5 py-1 rounded-full transition cursor-pointer font-semibold"
                >
                  {concept.desc} ({settings.currencySymbol}{concept.price})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Existing Added Items List */}
        <div className="pt-2">
          {items.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-earth-border-light rounded-2xl text-xs text-earth-secondary">
              <ShoppingBag className="w-8 h-8 mx-auto text-earth-border-light mb-2" />
              Aún no has agregado ningún artículo a este recibo.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-earth-text">
                <thead>
                  <tr className="border-b border-earth-border-light font-bold text-[#7A7A6A] uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Descripción</th>
                    <th className="pb-2 text-center w-16">Cant.</th>
                    <th className="pb-2 text-right w-24">Unitario</th>
                    <th className="pb-2 text-right w-24">Total</th>
                    <th className="pb-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E0D4]">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-bold text-earth-text">{item.description}</td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">{settings.currencySymbol}{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold text-earth-primary font-mono">
                        {settings.currencySymbol}{item.total.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. Payment method, Taxes, and moneyReceived calculator */}
      <div className="bg-[#FAF9F6] p-6 rounded-3xl border border-earth-border shadow-xs space-y-4">
        <h3 className="text-md font-serif italic text-earth-primary flex items-center gap-2">
          <span className="w-6 h-6 bg-earth-accent-bg rounded-full flex items-center justify-center text-earth-primary font-serif font-bold italic text-xs leading-none">4</span>
          Impuestos, Descuentos y Pago
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Método de Pago</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5"><CreditCard className="w-4 h-4 text-[#7A7A6A]" /></span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text cursor-pointer"
              >
                <option value="Efectivo">💵 Efectivo</option>
                <option value="Tarjeta de Crédito / Débito">💳 Tarjeta de Crédito / Débito</option>
                <option value="Transferencia Bancaria">🏦 Transferencia Bancaria</option>
                <option value="Pago Móvil / Bizum / SPEI">📲 Pago Móvil / Bizum / SPEI</option>
                <option value="PayPal / Stripe">🌐 PayPal / Stripe</option>
                <option value="Cheque Comercial">✍️ Cheque Comercial</option>
              </select>
            </div>
          </div>

          {/* Quick Cash Change Calculator */}
          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">
              Importe Recibido del Cliente (Para calcular vueltas/cambio)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-mono text-xs font-bold text-[#7A7A6A]">{settings.currencySymbol}</span>
              <input
                type="number"
                min="0"
                step="any"
                value={moneyReceived}
                onChange={(e) => setMoneyReceived(e.target.value)}
                placeholder="e.g. 50"
                className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
              />
            </div>
            {calculatedSums.change > 0 && (
              <p className="text-xs font-bold text-emerald-800 mt-1.5 flex items-center gap-1">
                <span>🔄 Cambio de Caja a Devolver:</span>
                <span className="font-mono">{settings.currencySymbol}{calculatedSums.change}</span>
              </p>
            )}
          </div>

          <div className="border-t border-earth-border-light col-span-1 sm:col-span-2 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[#7A7A6A]">
                  Descuento Aplicado (%):
                </label>
                <span className="text-xs font-bold text-earth-primary">{discount}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full h-1.5 bg-earth-border rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[#7A7A6A]">
                  Impuesto / IVA / VAT (%):
                </label>
                <span className="text-xs font-bold text-earth-primary">{taxRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full h-1.5 bg-earth-border rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Notes */}
      <div className="bg-[#FAF9F6] p-6 rounded-3xl border border-earth-border shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#7A7A6A] mb-1.5">
          Términos, Notas o Condiciones (Aparecen al pie)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Condiciones de cambio en un plazo de 15 días con este comprobante."
          className="w-full text-xs p-3 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text leading-relaxed"
        />
      </div>

      {/* Final operations buttons */}
      <div className="flex items-center justify-end gap-3 pt-3">
        {editingReceipt && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-5 py-3 border border-earth-border hover:bg-white rounded-full text-xs font-bold text-earth-primary transition cursor-pointer"
          >
            Cancelar Edición
          </button>
        )}
        <button
          type="submit"
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3 bg-earth-primary hover:bg-[#4A4A32] text-white font-bold text-xs rounded-full transition cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4" />
          {editingReceipt ? 'Guardar Cambios' : 'Registrar Recibo en Talonario'}
        </button>
      </div>

    </form>
  );
}
