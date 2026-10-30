import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Plus,
  DollarSign,
  Download,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Filter,
  Trash2,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Invoice, InvoiceLine, InvoicePayment, InvoiceStatus } from '../../types';

export const InvoiceList: React.FC = () => {
  const {
    invoices,
    clients,
    addInvoice,
    updateInvoice,
    recordPayment,
    workspaceSettings,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Preview & Print Modal
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Record Payment Modal
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<InvoicePayment['paymentMethod']>('Bank Wire / ACH');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // New Invoice Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newInvNumber, setNewInvNumber] = useState(`INV-2024-00${invoices.length + 92}`);
  const [newIssueDate, setNewIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState(new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0]);
  const [newTerms, setNewTerms] = useState('Net 15');
  const [newNotes, setNewNotes] = useState('Payment by wire or ACH preferred.');
  const [newLines, setNewLines] = useState<InvoiceLine[]>([
    {
      id: 'l1',
      description: 'Monthly Management Bookkeeping & Reconciliation Retainer',
      quantity: 1,
      unitPrice: 1800,
      taxRatePercent: 0,
      total: 1800,
    },
  ]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.clientCompany.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (clientFilter !== 'all' && inv.clientId !== clientFilter) return false;

      return true;
    });
  }, [invoices, search, statusFilter, clientFilter]);

  // Derived financial metrics
  const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.balanceDue, 0);
  const overdueTotal = invoices
    .filter(i => i.status === 'Overdue')
    .reduce((sum, i) => sum + i.balanceDue, 0);

  const handleAddLine = () => {
    setNewLines(prev => [
      ...prev,
      {
        id: `l-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRatePercent: 0,
        total: 0,
      },
    ]);
  };

  const handleUpdateLine = (id: string, updates: Partial<InvoiceLine>) => {
    setNewLines(prev =>
      prev.map(l => {
        if (l.id === id) {
          const updated = { ...l, ...updates };
          const qty = updated.quantity || 0;
          const price = updated.unitPrice || 0;
          const tax = (qty * price * (updated.taxRatePercent || 0)) / 100;
          updated.total = qty * price + tax;
          return updated;
        }
        return l;
      })
    );
  };

  const handleRemoveLine = (id: string) => {
    if (newLines.length <= 1) return;
    setNewLines(prev => prev.filter(l => l.id !== id));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clients.find(c => c.id === newClientId);
    if (!targetClient) return;

    const subtotal = newLines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
    const taxTotal = newLines.reduce((s, l) => s + (l.quantity * l.unitPrice * l.taxRatePercent) / 100, 0);
    const total = subtotal + taxTotal;

    addInvoice({
      invoiceNumber: newInvNumber,
      clientId: targetClient.id,
      clientName: targetClient.name,
      clientCompany: targetClient.company,
      clientAddress: targetClient.address,
      issueDate: newIssueDate,
      dueDate: newDueDate,
      currency: targetClient.currency,
      lines: newLines,
      subtotal,
      taxTotal,
      total,
      status: 'Sent',
      notes: newNotes,
      paymentTerms: newTerms,
    });

    setIsCreateOpen(false);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice || payAmount <= 0) return;

    recordPayment(paymentModalInvoice.id, {
      amount: Number(payAmount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod,
      referenceNumber: payRef || `WIRE-CONF-${Date.now().toString().slice(-6)}`,
      notes: payNotes,
    });

    setPaymentModalInvoice(null);
  };

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main">Firm-Service Invoices</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Bill clients for retainer bookkeeping, tax preparation, advisory, and payroll management.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Draft New Invoice
        </Button>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-[#087EDB]/50 transition-all">
          <span className="text-[11px] text-[#788596] font-bold uppercase tracking-wider">Total Invoiced (YTD)</span>
          <div className="text-2xl font-black text-[#202938] tracking-tight mt-1">
            {formatCurrency(totalBilled, 'USD')}
          </div>
          <span className="text-[11px] text-[#788596] mt-1 block">Across all active accounts</span>
        </div>

        <div className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-[#A7F477] transition-all">
          <span className="text-[11px] text-[#788596] font-bold uppercase tracking-wider">Collections Received</span>
          <div className="text-2xl font-black text-[#2A6605] tracking-tight mt-1">
            {formatCurrency(totalCollected, 'USD')}
          </div>
          <span className="text-[11px] text-[#2A6605] font-medium mt-1 block">Verified deposits in ledger</span>
        </div>

        <div className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-[#087EDB]/50 transition-all">
          <span className="text-[11px] text-[#788596] font-bold uppercase tracking-wider">Outstanding Balance</span>
          <div className="text-2xl font-black text-[#202938] tracking-tight mt-1">
            {formatCurrency(totalOutstanding, 'USD')}
          </div>
          <span className="text-[11px] text-[#788596] mt-1 block">Pending collection</span>
        </div>

        <div className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card hover:border-rose-300 transition-all">
          <span className="text-[11px] text-[#788596] font-bold uppercase tracking-wider">Overdue Firm Fees</span>
          <div className="text-2xl font-black text-rose-600 tracking-tight mt-1">
            {formatCurrency(overdueTotal, 'USD')}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">Past payment terms</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5EBF0] shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#788596] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice number or client company..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F3F7FA] hover:bg-white focus:bg-white border border-[#E5EBF0] rounded-xl text-xs text-[#202938] placeholder-[#788596] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20 shadow-subtle transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-semibold focus:outline-none shadow-subtle cursor-pointer"
          >
            <option value="all">All Invoices</option>
            <option value="Sent">Sent</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-semibold focus:outline-none shadow-subtle cursor-pointer"
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3F7FA] border-b border-[#E5EBF0] text-[#788596] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Paid</th>
                <th className="py-3.5 px-4">Balance Due</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#788596] font-medium">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const isOverdue = inv.status === 'Overdue';

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setPreviewInvoice(inv)}
                      className="hover:bg-[#F3F7FA] transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-[#202938] group-hover:text-[#087EDB] transition-colors">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-[#202938]">{inv.clientCompany}</span>
                        <div className="text-[10px] text-[#788596] mt-0.5">{inv.paymentTerms}</div>
                      </td>

                      <td className="py-4 px-4 text-[#788596] whitespace-nowrap">
                        {formatDate(inv.issueDate)}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-[#202938] font-medium'}>
                          {formatDate(inv.dueDate)}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-[#202938] whitespace-nowrap">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>

                      <td className="py-4 px-4 text-[#2A6605] font-semibold whitespace-nowrap">
                        {formatCurrency(inv.amountPaid, inv.currency)}
                      </td>

                      <td className="py-4 px-4 font-black whitespace-nowrap">
                        <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-[#788596]'}>
                          {formatCurrency(inv.balanceDue, inv.currency)}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge status={inv.status} size="sm" />
                      </td>

                      <td
                        className="py-4 px-6 text-right whitespace-nowrap"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.balanceDue > 0 && (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<CreditCard className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setPaymentModalInvoice(inv);
                                setPayAmount(inv.balanceDue);
                              }}
                            >
                              Record Pay
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewInvoice(inv)}
                          >
                            Preview PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Preview & Printable PDF Modal */}
      {previewInvoice && (
        <Modal
          isOpen={!!previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          title={`Invoice ${previewInvoice.invoiceNumber}`}
          subtitle={`Issued by ${workspaceSettings.firmName}`}
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-text-secondary">
                Payment Terms: {previewInvoice.paymentTerms}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => window.print()}
                >
                  Print Invoice
                </Button>
                {previewInvoice.balanceDue > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CreditCard className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setPaymentModalInvoice(previewInvoice);
                      setPayAmount(previewInvoice.balanceDue);
                    }}
                  >
                    Record Manual Payment
                  </Button>
                )}
              </div>
            </div>
          }
        >
          {/* Real Invoice Layout sheet */}
          <div className="p-8 bg-white border border-surface-border rounded-xl space-y-6 text-xs text-text-main shadow-subtle">
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-surface-border pb-6">
              <div>
                <div className="text-xl font-bold tracking-tight text-text-main">
                  {workspaceSettings.firmName}
                </div>
                <p className="text-text-secondary text-xs mt-1">
                  {workspaceSettings.legalEntityName}
                </p>
                <p className="text-text-secondary text-[11px]">
                  Tax Registration: {workspaceSettings.taxRegistrationNumber}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-brand-600 block">INVOICE</span>
                <span className="font-mono font-bold text-text-main text-sm block">
                  {previewInvoice.invoiceNumber}
                </span>
                <div className="mt-1">
                  <Badge status={previewInvoice.status} size="sm" />
                </div>
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-text-secondary font-semibold uppercase tracking-wider text-[10px] block mb-1">
                  Billed To Client:
                </span>
                <div className="font-bold text-sm text-text-main">{previewInvoice.clientCompany}</div>
                <div className="text-text-secondary">{previewInvoice.clientName}</div>
                <div className="text-text-secondary text-[11px] whitespace-pre-line mt-1">
                  {previewInvoice.clientAddress}
                </div>
              </div>

              <div className="text-right space-y-1">
                <div>
                  <span className="text-text-secondary">Issue Date:</span>{' '}
                  <strong>{formatDate(previewInvoice.issueDate)}</strong>
                </div>
                <div>
                  <span className="text-text-secondary">Payment Due Date:</span>{' '}
                  <strong className="text-rose-600">{formatDate(previewInvoice.dueDate)}</strong>
                </div>
                <div>
                  <span className="text-text-secondary">Currency:</span>{' '}
                  <strong>{previewInvoice.currency}</strong>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left border-collapse border border-surface-border">
              <thead>
                <tr className="bg-surface-subtle border-b border-surface-border text-[10px] uppercase font-bold text-text-secondary">
                  <th className="p-2.5">Service Description</th>
                  <th className="p-2.5 text-center">Qty / Period</th>
                  <th className="p-2.5 text-right">Unit Rate</th>
                  <th className="p-2.5 text-center">Tax %</th>
                  <th className="p-2.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewInvoice.lines.map(line => (
                  <tr key={line.id}>
                    <td className="p-2.5 font-medium">{line.description}</td>
                    <td className="p-2.5 text-center">{line.quantity}</td>
                    <td className="p-2.5 text-right">
                      {formatCurrency(line.unitPrice, previewInvoice.currency)}
                    </td>
                    <td className="p-2.5 text-center">{line.taxRatePercent}%</td>
                    <td className="p-2.5 text-right font-semibold">
                      {formatCurrency(line.total, previewInvoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-right">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(previewInvoice.subtotal, previewInvoice.currency)}</span>
                </div>
                {previewInvoice.taxTotal > 0 && (
                  <div className="flex justify-between text-text-secondary">
                    <span>Tax / VAT:</span>
                    <span>{formatCurrency(previewInvoice.taxTotal, previewInvoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-surface-border pt-2 text-text-main">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(previewInvoice.total, previewInvoice.currency)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(previewInvoice.amountPaid, previewInvoice.currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-surface-border pt-2 text-rose-600">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(previewInvoice.balanceDue, previewInvoice.currency)}</span>
                </div>
              </div>
            </div>

            {/* Notes & Audit Payments */}
            {previewInvoice.payments.length > 0 && (
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-1">
                <span className="font-bold text-emerald-800 text-[11px] block">
                  Recorded Payments History:
                </span>
                {previewInvoice.payments.map(p => (
                  <div key={p.id} className="text-[11px] text-emerald-700 flex justify-between">
                    <span>
                      {formatDate(p.paymentDate)} via {p.paymentMethod} (Ref: {p.referenceNumber})
                    </span>
                    <span className="font-bold">{formatCurrency(p.amount, previewInvoice.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={!!paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          title={`Record Payment for ${paymentModalInvoice.invoiceNumber}`}
          subtitle={`Client: ${paymentModalInvoice.clientCompany} • Balance: ${formatCurrency(
            paymentModalInvoice.balanceDue,
            paymentModalInvoice.currency
          )}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="block font-semibold text-text-main mb-1">Payment Amount *</label>
              <input
                type="number"
                step="0.01"
                required
                max={paymentModalInvoice.balanceDue}
                value={payAmount}
                onChange={e => setPayAmount(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-surface-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">Payment Method</label>
              <select
                value={payMethod}
                onChange={e => setPayMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg bg-white"
              >
                <option value="Bank Wire / ACH">Bank Wire / ACH</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Direct Debit">Direct Debit</option>
                <option value="Cheque">Physical Cheque</option>
                <option value="Stripe Manual">Stripe Manual Entry</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">
                Bank Reference / Confirmation Number *
              </label>
              <input
                type="text"
                required
                value={payRef}
                onChange={e => setPayRef(e.target.value)}
                placeholder="e.g. WIRE-CHASE-092182 or CHK-4091"
                className="w-full px-3 py-2 border border-surface-border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">Internal Note</label>
              <input
                type="text"
                value={payNotes}
                onChange={e => setPayNotes(e.target.value)}
                placeholder="Verified in operating bank balance..."
                className="w-full px-3 py-2 border border-surface-border rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm & Post Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create New Invoice Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Draft Firm Fee Invoice"
          subtitle="Generate itemized billing for accounting, payroll, and compliance engagements."
          maxWidth="4xl"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-text-main mb-1">Client *</label>
                <select
                  value={newClientId}
                  onChange={e => setNewClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-border rounded-lg bg-white"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Invoice Number *</label>
                <input
                  type="text"
                  required
                  value={newInvNumber}
                  onChange={e => setNewInvNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Payment Terms</label>
                <select
                  value={newTerms}
                  onChange={e => setNewTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-border rounded-lg bg-white"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Issue Date</label>
                <input
                  type="date"
                  required
                  value={newIssueDate}
                  onChange={e => setNewIssueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1">Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-border rounded-lg"
                />
              </div>
            </div>

            {/* Line items editor */}
            <div className="space-y-2 pt-2 border-t border-surface-border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-main uppercase tracking-wider text-[11px]">
                  Service Line Items
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={handleAddLine}
                >
                  Add Line Item
                </Button>
              </div>

              <div className="space-y-2">
                {newLines.map(line => (
                  <div key={line.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={line.description}
                      onChange={e => handleUpdateLine(line.id, { description: e.target.value })}
                      placeholder="Service scope description (e.g. Q3 VAT staging)..."
                      className="flex-1 px-3 py-1.5 border border-surface-border rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={e =>
                        handleUpdateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="Qty"
                      className="w-16 px-2 py-1.5 border border-surface-border rounded-lg text-xs text-center"
                    />
                    <input
                      type="number"
                      step="50"
                      min="0"
                      value={line.unitPrice}
                      onChange={e =>
                        handleUpdateLine(line.id, { unitPrice: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="Price"
                      className="w-24 px-2 py-1.5 border border-surface-border rounded-lg text-xs text-right"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={line.taxRatePercent}
                      onChange={e =>
                        handleUpdateLine(line.id, {
                          taxRatePercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Tax %"
                      className="w-16 px-2 py-1.5 border border-surface-border rounded-lg text-xs text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(line.id)}
                      className="p-1.5 text-text-secondary hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">
                Remittance & Payment Instructions
              </label>
              <textarea
                rows={2}
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Issue & Send Invoice
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
