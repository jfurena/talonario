import { useState, useEffect } from 'react';
import { Receipt, BusinessSettings } from './types';
import { DEFAULT_SETTINGS, MOCK_RECEIPTS } from './utils/defaults';
import ReceiptForm from './components/ReceiptForm';
import ReceiptPreview from './components/ReceiptPreview';
import ReceiptHistory from './components/ReceiptHistory';
import SettingsPanel from './components/SettingsPanel';
import { FileText, ClipboardList, Settings, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'settings'>('new');
  
  // Custom business settings saved in localStorage
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('talonario_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_SETTINGS;
  });

  // Receipts database saved in localStorage
  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem('talonario_receipts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { /* fallback */ }
    }
    // Seed with mock receipts if empty
    return MOCK_RECEIPTS(DEFAULT_SETTINGS);
  });

  // Editing state to track if we are modifying an existing receipt
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  // Active receipt style theme selected
  const [themeStyle, setThemeStyle] = useState<'classic' | 'ticket' | 'elegant'>(() => {
    const saved = localStorage.getItem('talonario_theme_style');
    return (saved as any) || 'classic';
  });

  // Selected receipt for detailed popup preview (especially for mobile viewing of past records)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Sync settings with localStorage
  useEffect(() => {
    localStorage.setItem('talonario_settings', JSON.stringify(settings));
  }, [settings]);

  // Sync receipts with localStorage
  useEffect(() => {
    localStorage.setItem('talonario_receipts', JSON.stringify(receipts));
  }, [receipts]);

  // Sync theme selection
  useEffect(() => {
    localStorage.setItem('talonario_theme_style', themeStyle);
  }, [themeStyle]);

  // Live draft tracking (to preview what is currently being edited in the form)
  const [liveDraft, setLiveDraft] = useState<Receipt>(() => {
    // Initial standard draft
    return {
      id: 'draft',
      receiptNumber: `${settings.receiptPrefix}${settings.nextReceiptNumber}`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Efectivo',
      clientName: 'Cliente Ejemplo',
      items: [
        { id: 'item-demo-1', description: 'Ejemplo de artículo comercial', quantity: 1, unitPrice: 200, total: 200 }
      ],
      taxRate: settings.defaultTaxRate,
      discount: settings.defaultDiscount,
      subtotal: 200,
      discountAmount: Number(((200 * settings.defaultDiscount) / 100).toFixed(2)),
      taxAmount: Number((((200 - (200 * settings.defaultDiscount) / 100) * settings.defaultTaxRate) / 100).toFixed(2)),
      total: 200,
      status: 'paid'
    };
  });

  // Handler: Save settings of business
  const handleSaveSettings = (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    alert('¡Configuración de tu negocio guardada con éxito!');
  };

  // Handler: Reset default demo settings and seed mock receipts
  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setReceipts(MOCK_RECEIPTS(DEFAULT_SETTINGS));
    setEditingReceipt(null);
    setSelectedReceipt(null);
    alert('Se han restablecido los valores de demostración originales.');
  };

  // Handler: Register a new or edited receipt into our ledger
  const handleSaveReceipt = (savedReceipt: Receipt) => {
    if (editingReceipt) {
      // Modify existing
      setReceipts(receipts.map((r) => (r.id === savedReceipt.id ? savedReceipt : r)));
      setEditingReceipt(null);
      alert(`Recibo ${savedReceipt.receiptNumber} actualizado correctamente.`);
    } else {
      // Create new
      setReceipts([savedReceipt, ...receipts]);
      
      // Update next index increment automatically!
      const currentNum = parseInt(savedReceipt.receiptNumber.replace(settings.receiptPrefix, '')) || settings.nextReceiptNumber;
      setSettings(prev => ({
        ...prev,
        nextReceiptNumber: Math.max(currentNum + 1, prev.nextReceiptNumber + 1)
      }));

      // Trigger user message
      alert(`¡Recibo ${savedReceipt.receiptNumber} registrado exitosamente!`);
    }
    
    // Smooth transition back to history so they can look at their new log
    setActiveTab('history');
  };

  // Handler: Turn an past invoice status into canceled in 1 click
  const handleCancelReceipt = (receiptId: string) => {
    setReceipts(
      receipts.map((r) => {
        if (r.id === receiptId) {
          return { ...r, status: 'canceled' as const };
        }
        return r;
      })
    );
    alert('Recibo marcado como Cancelado (Anulado) con éxito.');
  };

  // Handler: Delete receipt permanently
  const handleDeleteReceipt = (receiptId: string) => {
    setReceipts(receipts.filter((r) => r.id !== receiptId));
    if (selectedReceipt?.id === receiptId) {
      setSelectedReceipt(null);
    }
  };

  // Handler: Edit selection - opens edit tab
  const handleEditReceiptStart = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setActiveTab('new');
  };

  // Handler: Duplicate selection - populates fields with a new clean layout
  const handleDuplicateReceipt = (receipt: Receipt) => {
    const nextNum = `${settings.receiptPrefix}${settings.nextReceiptNumber}`;
    const duplicated: Receipt = {
      ...receipt,
      id: 'dup-' + Date.now(),
      receiptNumber: nextNum, // new sequential receipt number
      date: new Date().toISOString().split('T')[0], // today's date
      status: 'paid', // reset payment code
      moneyReceived: undefined,
      change: undefined,
    };
    
    setEditingReceipt(duplicated);
    setActiveTab('new');
    alert(`Se copiaron los conceptos en el formulario con el folio actual (${nextNum}).`);
  };

  return (
    <div className="min-h-screen bg-earth-bg text-earth-text font-sans print:bg-white print:p-0">
      
      {/* Dynamic Navigation Header - Hidden during print */}
      <header className="sticky top-0 z-40 bg-earth-bg/95 backdrop-blur-md border-b border-earth-border-light shadow-3xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
            {/* Logo and App Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-earth-primary flex items-center justify-center text-white shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-serif italic text-earth-primary tracking-tight flex items-center gap-1.5 leading-none">
                  Talonario Digital
                </h1>
                <p className="text-[10px] text-earth-secondary uppercase tracking-widest mt-1">Recibos rápidos y sencillos</p>
              </div>
            </div>

            {/* Main view navigation tabs */}
            <nav className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingReceipt(null);
                  setActiveTab('new');
                }}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition select-none cursor-pointer ${
                  activeTab === 'new' && !editingReceipt
                    ? 'bg-earth-primary text-white shadow-sm'
                    : 'border border-earth-border text-earth-primary bg-[#FAF9F6] hover:bg-earth-accent-bg'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>+ Nuevo Recibo</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition select-none cursor-pointer relative ${
                  activeTab === 'history'
                    ? 'bg-earth-primary text-white shadow-sm'
                    : 'border border-earth-border text-earth-primary bg-[#FAF9F6] hover:bg-earth-accent-bg'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Historial</span>
                {receipts.length > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                    activeTab === 'history' ? 'bg-[#FAF9F6] text-earth-primary' : 'bg-earth-accent-bg text-earth-secondary'
                  }`}>
                    {receipts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition select-none cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-earth-primary text-white shadow-sm'
                    : 'border border-earth-border text-earth-primary bg-[#FAF9F6] hover:bg-earth-accent-bg'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Primary Workspace container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0">
        
        {/* Dynamic header alerts for active states */}
        {editingReceipt && activeTab === 'new' && (
          <div className="mb-6 p-4 bg-earth-accent-bg/85 border border-[#E6E0D4] rounded-2xl text-xs flex items-center justify-between gap-4 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-earth-primary animate-pulse"></span>
              <p className="font-semibold text-[#5A5A40]">
                Estás editando el recibo registrado originalmente como: <strong className="font-mono text-earth-text">{editingReceipt.receiptNumber}</strong>
              </p>
            </div>
            <button
              onClick={() => setEditingReceipt(null)}
              className="text-[#5A5A40] underline hover:text-earth-primary-hover font-bold cursor-pointer"
            >
              Salir de Edición y crear un recibo nuevo
            </button>
          </div>
        )}

        {/* Tab Switch Router */}
        <div className="print:hidden">
          {activeTab === 'new' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Editor */}
              <div className="lg:col-span-7 space-y-4">
                <div className="mb-4">
                  <h2 className="text-3xl font-serif italic text-earth-primary tracking-tight">
                    {editingReceipt ? 'Modificar Recibo Registrado' : 'Datos del Recibo'}
                  </h2>
                  <p className="text-xs text-[#7A7A6A] font-bold uppercase tracking-widest mt-1">
                    Completa los detalles de cobro a continuación
                  </p>
                </div>
                <ReceiptForm
                  settings={settings}
                  savedReceipts={receipts}
                  onSave={handleSaveReceipt}
                  editingReceipt={editingReceipt}
                  onCancelEdit={() => setEditingReceipt(null)}
                  onThemeChange={(style) => setThemeStyle(style)}
                  currentTheme={themeStyle}
                />
              </div>

              {/* Right Column: Live Mockup Ticket Preview */}
              <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
                <div className="mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#7A7A6A]">Vista Previa del Recibo</h3>
                  <p className="text-[11px] text-[#7A7A6A] mt-0.5">Así se compone e imprime el comprobante final en vivo</p>
                </div>

                <ReceiptPreview
                  receipt={editingReceipt || liveDraft}
                  settings={settings}
                  themeStyle={themeStyle}
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-border-light pb-5">
                <div>
                  <h2 className="text-3xl font-serif italic text-earth-primary tracking-tight">
                    Talonario & Historial de Caja
                  </h2>
                  <p className="text-xs text-[#7A7A6A] font-bold uppercase tracking-widest mt-1">
                    Busca, imprime, anula o duplica folios anteriores de tu negocio
                  </p>
                </div>
                
                {receipts.length > 0 && (
                  <button
                    onClick={() => {
                      setEditingReceipt(null);
                      setActiveTab('new');
                    }}
                    className="inline-flex items-center gap-1.5 bg-earth-primary hover:bg-[#4A4A32] text-white font-bold text-xs px-6 py-3 rounded-full cursor-pointer transition shadow-xs"
                  >
                    + Emitir Nuevo Recibo
                  </button>
                )}
              </div>

              <ReceiptHistory
                receipts={receipts}
                settings={settings}
                onSelect={(rec) => setSelectedReceipt(rec)}
                onEdit={handleEditReceiptStart}
                onDuplicate={handleDuplicateReceipt}
                onCancelStatus={handleCancelReceipt}
                onDelete={handleDeleteReceipt}
                onNewReceiptClick={() => {
                  setEditingReceipt(null);
                  setActiveTab('new');
                }}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="border-b border-earth-border-light pb-5">
                <h2 className="text-3xl font-serif italic text-earth-primary tracking-tight">Configuración de la Empresa</h2>
                <p className="text-xs text-[#7A7A6A] font-bold uppercase tracking-widest mt-1">
                  Establece los perfiles predefinidos, marca comercial, desgloses fiscales y divisas
                </p>
              </div>

              <SettingsPanel
                settings={settings}
                onSave={handleSaveSettings}
                onResetDefaults={handleResetDefaults}
              />
            </div>
          )}
        </div>

        {/* 4. PRINTER AREA MOCK ROUTE FOR PHYSICAL CLEAN print:block */}
        <div className="hidden print:block absolute top-0 left-0 w-full bg-white text-black">
          <ReceiptPreview
            receipt={selectedReceipt || editingReceipt || liveDraft}
            settings={settings}
            themeStyle={themeStyle}
          />
        </div>

      </main>

      {/* Detailed overlay drawer / modal for past records */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-[#2D2D2A]/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-fade-in">
          <div className="bg-[#FAF9F6] rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-earth-border">
            
            {/* Modal header with receipt code */}
            <div className="px-6 py-4 bg-[#EAE7DF] border-b border-earth-border-light flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#7A7A6A] uppercase tracking-widest block font-sans">Detalle del Comprobante</span>
                <span className="text-lg font-serif italic text-earth-primary">Folio de Operación: {selectedReceipt.receiptNumber}</span>
              </div>
              
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full hover:bg-white text-[#7A7A6A] hover:text-earth-primary flex items-center justify-center transition cursor-pointer font-bold text-sm"
                title="Cerrar vista"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable preview view */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#E0DDD5]">
              <ReceiptPreview
                receipt={selectedReceipt}
                settings={settings}
                themeStyle={themeStyle}
              />
            </div>

            {/* Modal actions footer */}
            <div className="px-6 py-4 bg-white border-t border-earth-border-light flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-earth-border text-[#5A5A40] px-3.5 py-1 rounded-full text-[10px] font-bold font-sans">
                <Sparkles className="w-3.5 h-3.5" /> Respaldado en memoria local
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    handleEditReceiptStart(selectedReceipt);
                    setSelectedReceipt(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 border border-earth-border hover:bg-[#FAF9F6] rounded-full text-xs font-bold text-earth-primary transition cursor-pointer"
                >
                  Editar Recibo
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 sm:flex-none px-6 py-2 bg-earth-primary hover:bg-[#4A4A32] text-white rounded-full text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Global footer detail bar */}
      <footer className="border-t border-earth-border-light py-10 text-center text-xs text-[#7A7A6A] mt-20 print:hidden bg-[#EAE7DF]/40">
        <p className="font-serif italic text-[#5A5A40] text-[15px] mb-1">📋 Talonario Digital Autorizado para Pymes y Comercios</p>
        <p className="uppercase tracking-widest text-[9px] font-bold mt-1 max-w-xl mx-auto leading-relaxed">
          Los datos ingresados en esta aplicación no se guardan en ningún servidor externo; residen localmente en el navegador de manera 100% confidencial.
        </p>
      </footer>

    </div>
  );
}
