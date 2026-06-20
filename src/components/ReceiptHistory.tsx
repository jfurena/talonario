import React, { useState } from 'react';
import { Receipt, BusinessSettings } from '../types';
import { Search, Filter, Trash2, Edit2, Copy, Eye, Ban, Calendar, CheckCircle2, User, DollarSign, Wallet } from 'lucide-react';

interface ReceiptHistoryProps {
  receipts: Receipt[];
  settings: BusinessSettings;
  onSelect: (receipt: Receipt) => void;
  onEdit: (receipt: Receipt) => void;
  onDuplicate: (receipt: Receipt) => void;
  onCancelStatus: (receiptId: string) => void;
  onDelete: (receiptId: string) => void;
  onNewReceiptClick: () => void;
}

export default function ReceiptHistory({
  receipts,
  settings,
  onSelect,
  onEdit,
  onDuplicate,
  onCancelStatus,
  onDelete,
  onNewReceiptClick,
}: ReceiptHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'canceled'>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: settings.currencyCode || 'USD',
    }).format(amount).replace('USD', settings.currencyCode).replace('MXN', settings.currencyCode);
  };

  // Filter receipts based on terms
  const filteredReceipts = React.useMemo(() => {
    return receipts.filter((r) => {
      const matchSearch =
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.items.some((item) => item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  // Calculations for stats dashboard
  const stats = React.useMemo(() => {
    const activeReceipts = receipts.filter((r) => r.status !== 'canceled');
    const totalSales = activeReceipts.reduce((sum, r) => sum + r.total, 0);
    const totalCollected = receipts.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.total, 0);
    const totalPending = receipts.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.total, 0);
    const totalCanceled = receipts.filter((r) => r.status === 'canceled').reduce((sum, r) => sum + r.total, 0);

    return {
      totalSales,
      totalCollected,
      totalPending,
      totalCanceled,
      count: receipts.length,
    };
  }, [receipts]);

  return (
    <div className="space-y-6">
      
      {/* 1. Statistics Ribbon Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Facturado */}
        <div className="bg-[#FAF9F6] p-4 rounded-3xl border border-earth-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#7A7A6A] uppercase tracking-widest">Facturación Activa</span>
            <span className="w-8 h-8 rounded-xl bg-earth-accent-bg text-earth-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold font-serif text-earth-primary line-clamp-1">
              {formatCurrency(stats.totalSales)}
            </span>
            <p className="text-[9px] text-[#7A7A6A] mt-1">Excluye comprobantes anulados</p>
          </div>
        </div>

        {/* Total Recaudado / Cobrado */}
        <div className="bg-[#FAF9F6] p-4 rounded-3xl border border-earth-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#7A7A6A] uppercase tracking-widest">Total Cobrado</span>
            <span className="w-8 h-8 rounded-xl bg-earth-accent-bg text-earth-primary flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold font-serif text-earth-primary line-clamp-1">
              {formatCurrency(stats.totalCollected)}
            </span>
            <p className="text-[9px] text-[#5A5A40] font-semibold mt-1">✓ En caja física o digital</p>
          </div>
        </div>

        {/* Total Pendiente */}
        <div className="bg-[#FAF9F6] p-4 rounded-3xl border border-earth-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Saldo Pendiente</span>
            <span className="w-8 h-8 rounded-xl bg-amber-55 bg-earth-accent-bg text-earth-primary flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold font-serif text-earth-primary line-clamp-1">
              {formatCurrency(stats.totalPending)}
            </span>
            <p className="text-[9px] text-amber-700 font-semibold mt-1">⏱ Por cobrar posteriormente</p>
          </div>
        </div>

        {/* Count and metadata */}
        <div className="bg-[#FAF9F6] p-4 rounded-3xl border border-earth-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#7A7A6A] uppercase tracking-widest">Folios Emitidos</span>
            <span className="w-8 h-8 rounded-xl bg-earth-accent-bg text-[#7A7A6A] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold font-serif text-earth-primary">
              {stats.count}
            </span>
            <p className="text-[9px] text-[#7A7A6A] mt-1">
              Anulados: {receipts.filter((r) => r.status === 'canceled').length} items
            </p>
          </div>
        </div>
      </div>

      {/* 2. List Control Bar (Search & Filter) */}
      <div className="bg-[#FAF9F6] p-4 rounded-3xl border border-earth-border shadow-xs flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-3.5"><Search className="w-4 h-4 text-[#7A7A6A]" /></span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, folio (recibo), concepto o notas de pie..."
            className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-earth-border-light bg-white focus:border-earth-primary outline-none text-earth-text"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 min-w-[180px]">
          <span className="text-earth-secondary"><Filter className="w-4 h-4" /></span>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-earth-border bg-white text-earth-text outline-none focus:border-earth-primary cursor-pointer"
          >
            <option value="all">📁 Todos los estados</option>
            <option value="paid">🟢 Pagados (Listos)</option>
            <option value="pending">🟡 Pendientes</option>
            <option value="canceled">⚪ Cancelados (Anulados)</option>
          </select>
        </div>
      </div>

      {/* 3. Receipts List */}
      <div className="space-y-3">
        {filteredReceipts.length === 0 ? (
          <div className="bg-[#FAF9F6] p-12 text-center rounded-3xl border border-earth-border shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-earth-accent-bg text-earth-primary flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="max-w-xs mx-auto">
              <p className="text-sm font-bold text-earth-text">No se encontraron recibos</p>
              <p className="text-xs text-[#7A7A6A] mt-1 leading-relaxed">
                Prueba cambiando los términos de búsqueda o registrando un nuevo comprobante ahora mismo.
              </p>
            </div>
            <button
              onClick={onNewReceiptClick}
              className="mt-2 inline-flex items-center gap-1.5 px-6 py-2 bg-earth-primary hover:bg-[#4A4A32] text-white font-bold text-xs rounded-full transition cursor-pointer"
            >
              Emitir Comprobante
            </button>
          </div>
        ) : (
          filteredReceipts.map((receipt) => {
            const firstItemDesc = receipt.items[0]?.description || 'Sin conceptos';
            const extraItemsCount = receipt.items.length - 1;
            const itemsSummary = extraItemsCount > 0 
              ? `${firstItemDesc} (+${extraItemsCount} más)` 
              : firstItemDesc;

            return (
              <div
                key={receipt.id}
                className="group bg-[#FAF9F6] hover:bg-white p-4 sm:p-5 rounded-3xl border border-earth-border hover:border-earth-primary shadow-xs transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side: Id, date, Client */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                    receipt.status === 'paid' 
                      ? 'bg-[#5A5A40]' 
                      : receipt.status === 'pending'
                      ? 'bg-amber-500'
                      : 'bg-[#FAF9F6] border border-earth-border'
                  }`}></div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-mono text-xs font-bold text-earth-primary tracking-wide">
                        {receipt.receiptNumber}
                      </span>
                      <span className="text-[10px] text-[#7A7A6A] flex items-center gap-1 font-bold uppercase tracking-wider">
                        <Calendar className="w-3 h-3" /> {receipt.date}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        receipt.status === 'paid'
                          ? 'bg-earth-accent-bg text-earth-primary border border-earth-border-light'
                          : receipt.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-white text-earth-secondary border border-earth-border-light'
                      }`}>
                        {receipt.status === 'paid' ? 'Pagado' : receipt.status === 'pending' ? 'Pendiente' : 'Anulado'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-earth-text font-bold">
                      <User className="w-3.5 h-3.5 text-[#7A7A6A]" />
                      <span className="truncate">{receipt.clientName}</span>
                    </div>

                    <p className="text-[11px] text-earth-secondary truncate italic">
                      {itemsSummary}
                    </p>
                  </div>
                </div>

                {/* Right side: Amount and operational actions */}
                <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-earth-border-light">
                  {/* Total Value */}
                  <div className="text-left md:text-right pr-2">
                    <p className="text-[9px] text-[#7A7A6A] uppercase font-bold tracking-widest">Total</p>
                    <p className="text-base font-bold text-earth-text tracking-tight font-mono">
                      {formatCurrency(receipt.total)}
                    </p>
                  </div>

                  {/* Operational Quick buttons */}
                  <div className="flex items-center gap-1">
                    {/* View/Preview */}
                    <button
                      onClick={() => onSelect(receipt)}
                      title="Ver e Imprimir"
                      className="p-2 text-earth-secondary hover:text-earth-primary hover:bg-[#EAE7DF] rounded-xl transition cursor-pointer"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => onDuplicate(receipt)}
                      title="Duplicar / Reutilizar Concepto"
                      className="p-2 text-earth-secondary hover:text-earth-primary hover:bg-[#EAE7DF] rounded-xl transition cursor-pointer"
                    >
                      <Copy className="w-4.5 h-4.5" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(receipt)}
                      title="Editar"
                      className="p-2 text-earth-secondary hover:text-earth-primary hover:bg-[#EAE7DF] rounded-xl transition cursor-pointer"
                    >
                      <Edit2 className="w-4.5 h-4.5" />
                    </button>

                    {/* Anular */}
                    {receipt.status !== 'canceled' && (
                      <button
                        onClick={() => onCancelStatus(receipt.id)}
                        title="Anular Recibo"
                        className="p-2 text-earth-secondary hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <Ban className="w-4.5 h-4.5" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de eliminar permanentemente el recibo ${receipt.receiptNumber}?`)) {
                          onDelete(receipt.id);
                        }
                      }}
                      title="Eliminar del Historial"
                      className="p-2 text-earth-secondary hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
