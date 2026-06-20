import React, { useState } from 'react';
import { BusinessSettings } from '../types';
import { Save, RefreshCw, Upload, Image, X } from 'lucide-react';

interface SettingsPanelProps {
  settings: BusinessSettings;
  onSave: (settings: BusinessSettings) => void;
  onResetDefaults: () => void;
}

export default function SettingsPanel({ settings, onSave, onResetDefaults }: SettingsPanelProps) {
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [taxId, setTaxId] = useState(settings.taxId || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [email, setEmail] = useState(settings.email || '');
  const [address, setAddress] = useState(settings.address || '');
  
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode);
  
  const [defaultNotes, setDefaultNotes] = useState(settings.defaultNotes || '');
  const [defaultTaxRate, setDefaultTaxRate] = useState(settings.defaultTaxRate);
  const [defaultDiscount, setDefaultDiscount] = useState(settings.defaultDiscount);
  const [receiptPrefix, setReceiptPrefix] = useState(settings.receiptPrefix);
  const [nextReceiptNumber, setNextReceiptNumber] = useState(settings.nextReceiptNumber);
  
  const [logoFile, setLogoFile] = useState(settings.logoFile || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');

  // Handle Logo Upload to Base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 150000) { // Limit to 150KB for localStorage health
        alert('Por favor, sube una imagen con un tamaño menor a 150KB para asegurar el rendimiento.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoFile(reader.result as string);
        setLogoUrl(''); // prioritize file uploads
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoFile('');
    setLogoUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim()) {
      alert('El Nombre de tu Negocio es obligatorio.');
      return;
    }

    onSave({
      businessName: businessName.trim(),
      taxId: taxId.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      currencySymbol: currencySymbol.trim() || '$',
      currencyCode: currencyCode.trim() || 'USD',
      defaultNotes: defaultNotes.trim() || undefined,
      defaultTaxRate: Number(defaultTaxRate),
      defaultDiscount: Number(defaultDiscount),
      receiptPrefix: receiptPrefix.trim() || 'REC-',
      nextReceiptNumber: Number(nextReceiptNumber) || 101,
      logoFile: logoFile || undefined,
      logoUrl: logoUrl.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. General Business profile Card */}
      <div className="bg-[#FAF9F6] p-6 rounded-3xl border border-earth-border shadow-xs space-y-4">
        <h3 className="text-md font-serif italic text-earth-primary border-b border-[#E6E0D4] pb-3 flex items-center justify-between">
          <span>📋 Perfil de tu Negocio / Emisor</span>
          <span className="text-[10px] font-bold text-[#7A7A6A] uppercase tracking-widest font-sans">Cabecera de Recibos</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Nombre Comercial de tu Negocio / Empresa*</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Boutique de Modas Chic"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Identificación Tributaria (DNI / RUT / NIT / RFC / NIF)</label>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="e.g. RUT 76.543.210-9"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Teléfono Móvil / Fijo</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +34 600 111 222"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Dirección de Operación / Local</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Centro Comercial Plaza, Local 15, Santiago"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Correo Electrónico Comercial</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. facturacion@minegocio.com"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>
        </div>

        {/* Brand Logo Upload Module */}
        <div className="pt-4 border-t border-[#E6E0D4]">
          <label className="block text-xs font-bold text-earth-secondary mb-2 uppercase tracking-wide">Logo de tu Negocio</label>
          <div className="flex items-center gap-4 flex-wrap">
            {logoFile ? (
              <div className="relative w-24 h-24 bg-white border border-[#E6E0D4] rounded-2xl flex items-center justify-center p-2 group">
                <img src={logoFile} alt="Preview" className="max-w-full max-h-full object-contain" />
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : logoUrl ? (
              <div className="relative w-24 h-24 bg-white border border-[#E6E0D4] rounded-2xl flex items-center justify-center p-2">
                <img src={logoUrl} alt="Preview URL" className="max-w-full max-h-full object-contain" />
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 bg-white border-2 border-dashed border-[#E6E0D4] rounded-2xl flex flex-col items-center justify-center text-earth-secondary text-center p-2">
                <Image className="w-6 h-6 text-[#7A7A6A] mb-1" />
                <span className="text-[10px] font-bold">Sin Logotipo</span>
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EAE7DF] hover:bg-[#DCDCD2] text-earth-primary font-bold text-xs rounded-full cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" /> Subir Imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-[#7A7A6A] font-medium font-sans">PNG, JPG (Max 150KB)</span>
              </div>
              <div className="max-w-sm">
                <span className="text-[10px] text-[#7A7A6A] font-bold block mb-0.5">O pega la URL de tu imagen:</span>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    setLogoFile(''); // prioritize direct input
                  }}
                  placeholder="https://ejemplo.com/mi-logo.png"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#E6E0D4] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Currency and sequences Sequence Controls */}
      <div className="bg-[#FAF9F6] p-6 rounded-3xl border border-earth-border shadow-xs space-y-4">
        <h3 className="text-md font-serif italic text-earth-primary border-b border-[#E6E0D4] pb-3 flex items-center gap-2">
          <span>⚙️ Moneda y Numeración de Folios</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Símbolo de Moneda</label>
            <input
              type="text"
              required
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              placeholder="e.g. $, €, Q, Bs."
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Código ISO de Divisa</label>
            <input
              type="text"
              required
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
              placeholder="e.g. USD, EUR, COP, MXN, PEN"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Prefijo de Folios</label>
            <input
              type="text"
              value={receiptPrefix}
              onChange={(e) => setReceiptPrefix(e.target.value)}
              placeholder="e.g. REC-"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Siguiente Número de Comprobante</label>
            <input
              type="number"
              required
              value={nextReceiptNumber}
              onChange={(e) => setNextReceiptNumber(parseInt(e.target.value) || 1)}
              placeholder="e.g. 101"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Predefinidos defaults (Taxes, footer terms) */}
      <div className="bg-[#FAF9F6] p-6 rounded-3xl border border-earth-border shadow-xs space-y-4">
        <h3 className="text-md font-serif italic text-earth-primary border-b border-[#E6E0D4] pb-3">
          📝 Valores Predefinidos para Nuevos Recibos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Impuesto Default (IVA%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={defaultTaxRate}
              onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Descuento Default (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={defaultDiscount}
              onChange={(e) => setDefaultDiscount(parseFloat(e.target.value) || 0)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-earth-secondary mb-1">Notas, Condiciones o Pie de Página Default</label>
            <textarea
              rows={3}
              value={defaultNotes}
              onChange={(e) => setDefaultNotes(e.target.value)}
              placeholder="e.g. Este documento constituye un recibo de caja de pago y liberación de firma. Conservar para cambios."
              className="w-full text-xs p-3 rounded-xl border border-earth-border bg-white focus:border-earth-primary outline-none text-earth-text leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Settings row */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 gap-4">
        <button
          type="button"
          onClick={() => {
            if (confirm('¿Estás seguro de restablecer los datos originales de demostración?')) {
              onResetDefaults();
            }
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 border border-earth-border hover:bg-[#FAF9F6] rounded-full text-xs font-bold text-[#7A7A6A] bg-white transition select-none cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Restaurar Valores Demo
        </button>

        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-earth-primary hover:bg-[#4A4A32] text-white font-bold text-xs rounded-full transition cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4" />
          Guardar Configuración
        </button>
      </div>

    </form>
  );
}
