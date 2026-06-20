import { Receipt, BusinessSettings } from '../types';
import { numeroALetras } from '../utils/numberToWords';
import { FileText, Printer, Check, Clock, AlertTriangle, Building, Phone, Mail, MapPin } from 'lucide-react';

interface ReceiptPreviewProps {
  receipt: Receipt;
  settings: BusinessSettings;
  themeStyle?: 'classic' | 'ticket' | 'elegant';
}

export default function ReceiptPreview({ receipt, settings, themeStyle = 'classic' }: ReceiptPreviewProps) {
  // Safe formatting helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: settings.currencyCode || 'USD',
    }).format(amount).replace('USD', settings.currencyCode).replace('MXN', settings.currencyCode);
  };

  const getStatusBadge = (status: Receipt['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-earth-accent-bg text-earth-primary border border-earth-border-light">
            <Check className="w-3 h-3" /> Pagado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" /> Cancelado
          </span>
        );
    }
  };

  // Printable function
  const handlePrint = () => {
    window.print();
  };

  // Convert total to words
  const currencyNameMap: Record<string, string> = {
    'USD': 'dólares',
    'EUR': 'euros',
    'MXN': 'pesos',
    'COP': 'pesos',
    'CLP': 'pesos',
    'PEN': 'soles',
    'ARS': 'pesos',
    'GTQ': 'quetzales',
    'VEF': 'bolívares',
    'VES': 'bolívares soberanos',
    'UYU': 'pesos uruguayos',
    'BOB': 'bolivianos',
  };
  const cName = currencyNameMap[settings.currencyCode] || 'unidades';
  const totalInWords = numeroALetras(receipt.total, cName);

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] border border-earth-border rounded-3xl overflow-hidden shadow-xs">
      {/* Top action bar - hidden during print */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#FAF9F6] border-b border-earth-border-light print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-earth-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A7A6A]">Visualizador en Vivo</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            id="btn-print-receipt"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-earth-primary hover:bg-[#4A4A32] shadow-xs text-white font-bold text-xs rounded-full transition duration-150 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Comprobante
          </button>
        </div>
      </div>

      {/* Customizable Receipt Card Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center print:p-0 print:bg-white print:overflow-visible bg-[#E0DDD5]/40">
        <div 
          id="print-area"
          className={`w-full max-w-[480px] bg-white print:shadow-none print:border-none print:w-full print:max-w-none transition-all duration-200 ${
            themeStyle === 'ticket' 
              ? 'p-6 font-mono border-dashed border-2 border-earth-text text-earth-text rounded-none shadow-sm'
              : themeStyle === 'elegant'
              ? 'p-8 border-t-8 border-earth-primary border-x border-b border-earth-border-light rounded-2xl shadow-md text-earth-text'
              : 'p-8 border border-earth-border-light rounded-3xl shadow-sm bg-gradient-to-b from-[#FAF9F6] to-white text-earth-text relative'
          }`}
        >
          {/* Classic watermark/header shape */}
          {themeStyle === 'classic' && (
            <div className="absolute top-0 right-10 w-24 h-1.5 bg-earth-primary rounded-b-md"></div>
          )}

          {/* 1. Header Section */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Business Info */}
              <div className="space-y-1 sm:max-w-[65%]">
                {settings.logoFile ? (
                  <img src={settings.logoFile} alt="Logo" className="max-h-12 w-auto mb-2 object-contain" referrerPolicy="no-referrer" />
                ) : settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="max-h-12 w-auto mb-2 object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-1 ${
                    themeStyle === 'ticket' ? 'border-2 border-earth-text text-earth-text' : 'bg-earth-primary text-white'
                  }`}>
                    <Building className="w-4.5 h-4.5" />
                  </div>
                )}
                <h2 className={`font-serif italic font-bold tracking-tight ${themeStyle === 'ticket' ? 'text-lg uppercase font-sans not-italic' : 'text-xl text-earth-primary'}`}>
                  {settings.businessName || 'Mi Negocio'}
                </h2>
                {settings.taxId && (
                  <p className="text-xs text-earth-secondary font-medium">
                    NIF/RUT/RUC/RFC: <span className="font-semibold text-earth-text">{settings.taxId}</span>
                  </p>
                )}
                
                <div className="pt-1 space-y-0.5 text-[11px] text-earth-secondary">
                  {settings.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{settings.address}</span>
                    </div>
                  )}
                  {settings.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{settings.phone}</span>
                    </div>
                  )}
                  {settings.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span>{settings.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Title and Meta */}
              <div className="sm:text-right flex-shrink-0 flex flex-col items-start sm:items-end gap-1.5 pt-1">
                <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full ${
                  themeStyle === 'ticket' 
                    ? 'border border-black text-black' 
                    : 'bg-[#EAE7DF] text-earth-primary border border-earth-border-light'
                }`}>
                  RECIBO DE CAJA
                </span>
                <div className="mt-1">
                  <p className="text-[9px] text-[#7A7A6A] font-bold uppercase tracking-widest">Ref. / Folio</p>
                  <p className="font-mono text-xs font-bold text-earth-text tracking-wider">
                    {receipt.receiptNumber}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[9px] text-[#7A7A6A] font-bold uppercase tracking-widest">Fecha</p>
                  <p className="text-xs font-semibold text-earth-text">{receipt.date}</p>
                </div>
                <div className="mt-1 print:block">
                  {getStatusBadge(receipt.status)}
                </div>
              </div>
            </div>
          </div>

          <div className={`border-t my-4 ${themeStyle === 'ticket' ? 'border-dashed border-earth-text' : 'border-earth-border-light'}`}></div>

          {/* 2. Client Info Section */}
          <div className={`rounded-xl ${themeStyle === 'ticket' ? 'py-1' : 'bg-[#FAF9F6] p-4 border border-[#E6E0D4]'}`}>
            <h3 className={`text-[10px] font-bold tracking-widest text-[#7A7A6A] uppercase mb-2 ${themeStyle === 'ticket' && '!text-black font-sans'}`}>
              RECIBIDO DE (CLIENTE):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <p className="text-[9px] text-[#7A7A6A] uppercase tracking-wider">Nombre o Razón Social</p>
                <p className="text-xs font-bold text-earth-text">{receipt.clientName || 'Cliente General'}</p>
              </div>
              {receipt.clientTaxId && (
                <div>
                  <p className="text-[9px] text-[#7A7A6A] uppercase tracking-wider">Identificación Fiscal</p>
                  <p className="text-xs font-semibold text-earth-text">{receipt.clientTaxId}</p>
                </div>
              )}
              {receipt.clientPhone && (
                <div>
                  <p className="text-[9px] text-[#7A7A6A] uppercase tracking-wider">Teléfono</p>
                  <p className="text-xs font-medium text-earth-text">{receipt.clientPhone}</p>
                </div>
              )}
              {receipt.clientEmail && (
                <div>
                  <p className="text-[9px] text-[#7A7A6A] uppercase tracking-wider">Correo Electrónico</p>
                  <p className="text-xs font-medium text-earth-text truncate">{receipt.clientEmail}</p>
                </div>
              )}
              {receipt.clientAddress && (
                <div className="sm:col-span-2">
                  <p className="text-[9px] text-[#7A7A6A] uppercase tracking-wider">Dirección</p>
                  <p className="text-xs font-medium text-earth-text">{receipt.clientAddress}</p>
                </div>
              )}
            </div>
          </div>

          <div className={`border-t my-5 ${themeStyle === 'ticket' ? 'border-dashed border-earth-text' : 'border-earth-border-light'}`}></div>

          {/* 3. Items Table */}
          <div className="mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[9px] font-bold tracking-widest text-[#7A7A6A] uppercase ${
                  themeStyle === 'ticket' ? 'border-black text-black' : 'border-earth-border-light pb-2'
                }`}>
                  <th className="pb-2 font-semibold">Concepto / Detalle</th>
                  <th className="pb-2 text-center font-semibold w-12">Cant.</th>
                  <th className="pb-2 text-right font-semibold w-24">Precio Un.</th>
                  <th className="pb-2 text-right font-semibold w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-border-light">
                {receipt.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-xs text-earth-secondary italic">
                      Sin conceptos agregados
                    </td>
                  </tr>
                ) : (
                  receipt.items.map((item) => (
                    <tr key={item.id} className="text-xs">
                      <td className="py-2.5 pr-2 font-bold text-earth-text break-words max-w-[200px]">{item.description}</td>
                      <td className="py-2.5 text-center text-earth-secondary">{item.quantity}</td>
                      <td className="py-2.5 text-right text-earth-secondary font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-bold text-earth-text font-mono">{formatCurrency(item.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Totals & Numerical Desglose */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1 mb-6">
            {/* Metodo de Pago */}
            <div className="text-xs text-earth-secondary space-y-1 sm:max-w-[45%]">
              <div>
                <span className="font-bold text-[#7A7A6A] uppercase text-[9px] tracking-wide">Método de Pago:</span>
                <p className="font-bold text-earth-text">{receipt.paymentMethod || 'Efectivo'}</p>
              </div>
              {receipt.moneyReceived !== undefined && receipt.moneyReceived > 0 && (
                <div className="pt-1.5 space-y-0.5 border-t border-earth-border-light mt-1.5">
                  <div className="flex justify-between gap-2">
                    <span>Entregado:</span>
                    <span className="font-semibold">{formatCurrency(receipt.moneyReceived)}</span>
                  </div>
                  {receipt.change !== undefined && receipt.change >= 0 && (
                    <div className="flex justify-between gap-2 text-earth-primary font-bold">
                      <span>Cambio/Vuelto:</span>
                      <span>{formatCurrency(receipt.change)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Totals Box */}
            <div className={`flex-1 sm:max-w-[50%] ml-auto space-y-1.5 text-xs ${
              themeStyle === 'ticket' ? 'border-t border-dashed border-earth-text pt-2' : ''
            }`}>
              <div className="flex justify-between text-earth-secondary">
                <span>Subtotal:</span>
                <span className="font-medium font-mono">{formatCurrency(receipt.subtotal)}</span>
              </div>
              
              {receipt.discountAmount > 0 && (
                <div className="flex justify-between text-amber-800 font-medium">
                  <span>Descuento ({receipt.discount}%):</span>
                  <span className="font-mono">-{formatCurrency(receipt.discountAmount)}</span>
                </div>
              )}

              {receipt.taxAmount > 0 && (
                <div className="flex justify-between text-earth-secondary font-medium">
                  <span>Impuesto ({receipt.taxRate}%):</span>
                  <span className="font-mono">+{formatCurrency(receipt.taxAmount)}</span>
                </div>
              )}

              <div className={`flex justify-between items-center text-sm font-bold border-t pt-2 mt-2 ${
                themeStyle === 'ticket' ? 'border-black' : 'border-earth-border-light text-earth-text'
              }`}>
                <span className="text-sm font-serif italic text-earth-primary">Total:</span>
                <span className="text-lg tracking-tight text-earth-primary font-bold font-mono print:text-black">
                  {formatCurrency(receipt.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Text total write out (La cantidad de ...) */}
          {receipt.total > 0 && (
            <div className={`p-3 rounded-xl text-[11px] leading-relaxed mb-6 italic text-earth-secondary bg-[#FAF9F6] border border-[#E6E0D4] ${
              themeStyle === 'ticket' ? 'border-dashed border-black rounded-none p-2 bg-transparent text-black' : ''
            }`}>
              <span className="font-bold not-italic text-[9px] uppercase tracking-widest block text-[#7A7A6A] mb-0.5">Suma total en letras:</span>
              " {totalInWords} "
            </div>
          )}

          {/* 5. Stamp / Signature area for physical receipt touch */}
          <div className="mt-8 flex items-end justify-between gap-4">
            {/* Signature field left */}
            <div className="w-[45%] text-center">
              <div className={`h-12 border-b ${themeStyle === 'ticket' ? 'border-earth-text' : 'border-earth-border-light'}`}></div>
              <p className="text-[9px] font-bold text-[#7A7A6A] uppercase tracking-wider mt-1.5">Firma Emisor</p>
            </div>

            {/* Stamp/Signature field right */}
            <div className="w-[45%] text-center">
              <div className="h-12 flex items-center justify-center">
                {receipt.status === 'paid' ? (
                  <div className={`border-2 rounded px-3 py-1 font-mono uppercase text-xs font-extrabold tracking-widest transform -rotate-12 ${
                    themeStyle === 'ticket' 
                      ? 'border-black text-black' 
                      : 'border-[#5A5A40] text-[#5A5A40] bg-[#FAF9F6]/50'
                  }`}>
                    PAGADO
                  </div>
                ) : receipt.status === 'pending' ? (
                  <div className="border-2 border-amber-600 text-amber-600 rounded px-3 py-1 font-mono uppercase text-xs font-bold tracking-widest transform -rotate-12 bg-amber-50/10">
                    PENDIENTE
                  </div>
                ) : (
                  <div className="border-2 border-rose-600 text-rose-600 rounded px-2 py-0.5 font-mono uppercase text-[10px] font-bold tracking-widest transform -rotate-12 bg-rose-50/10">
                    CANCELADO
                  </div>
                )}
              </div>
              <p className="text-[9px] font-bold text-[#7A7A6A] uppercase tracking-wider mt-1.5">Sello / Estado</p>
            </div>
          </div>

          {/* Notes and footer warning info */}
          {receipt.notes && (
            <div className="mt-8 pt-4 border-t border-earth-border-light">
              <p className="text-[9px] font-bold tracking-wider text-[#7A7A6A] uppercase mb-1">Notas Adicionales:</p>
              <p className="text-xs text-earth-secondary leading-relaxed break-words">{receipt.notes}</p>
            </div>
          )}

          {/* Footer branding/warning */}
          <div className="mt-8 pt-4 border-t border-earth-border-light text-center">
            <p className="text-[9px] text-[#7A7A6A] tracking-wider uppercase">
              Emitido mediante Talonario Digital. Copia de respaldo de control interno comercial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
