import React, { useState } from 'react';
import {
  FileUp,
  Download,
  AlertCircle,
  CheckCircle2,
  Table,
  ArrowRight,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { ClientType } from '../../types';

interface ClientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  company: string;
  name: string;
  email: string;
  clientType: ClientType;
  country: string;
  currency: 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';
  phone?: string;
  isValid: boolean;
  error?: string;
}

const SAMPLE_CSV = `Company,Contact Name,Email,Client Type,Country,Currency,Phone
Acme FinTech Corp,Sarah Connor,sarah@acmefin.com,Corporate,United States,USD,+1 555-0199
Nordic BioHealth Ltd,Lars Mikkelsen,lars@nordicbio.eu,LLC / Partnership,United Kingdom,GBP,+44 20 7946 0811
Oasis Ventures,Amira Hassan,amira@oasisventures.ae,Corporate,United States,USD,+1 555-0244`;

export const ClientImportModal: React.FC<ClientImportModalProps> = ({ isOpen, onClose }) => {
  const { addClient, allUsers, addAuditLog } = useApp();
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const handleParse = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) return;

    const rows: ParsedRow[] = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));

      const [company, name, email, clientType, country, currency, phone] = cols;

      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
      let isValid = true;
      let error = '';

      if (!company) {
        isValid = false;
        error = 'Missing company name';
      } else if (!name) {
        isValid = false;
        error = 'Missing contact person';
      } else if (!isValidEmail) {
        isValid = false;
        error = 'Invalid email address';
      }

      const validCurrencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'];
      const validCurrency = validCurrencies.includes(currency) ? (currency as any) : 'USD';

      rows.push({
        company: company || 'Unknown Company',
        name: name || 'Primary Contact',
        email: email || '',
        clientType: (clientType as ClientType) || 'Corporate',
        country: country || 'United States',
        currency: validCurrency,
        phone: phone || '',
        isValid,
        error,
      });
    }

    setParsedRows(rows);
    setStep('preview');
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    const defaultStaffId = allUsers.find(u => u.role !== 'Client')?.id || allUsers[0].id;

    validRows.forEach(row => {
      addClient({
        company: row.company,
        name: row.name,
        email: row.email,
        clientType: row.clientType,
        phone: row.phone || '',
        address: '',
        country: row.country,
        currency: row.currency,
        timeZone: 'America/New_York',
        assignedAccountantId: defaultStaffId,
        teamMemberIds: [defaultStaffId],
        services: ['Monthly Bookkeeping', 'Payroll Operations'],
        startDate: new Date().toISOString().split('T')[0],
        billingFrequency: 'Monthly Retainer',
        status: 'Active',
        notes: 'Imported via CSV migration wizard.',
        portalAccessEnabled: true,
      });
    });

    addAuditLog(
      'Imported Clients via CSV',
      'Client',
      `Bulk onboarded ${validRows.length} clients via column-mapped CSV validation wizard.`
    );

    setImportSummary(`Successfully imported ${validRows.length} clients into your practice directory.`);
    setTimeout(() => {
      setImportSummary(null);
      setStep('input');
      onClose();
    }, 1800);
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LedgerFlow_Client_Import_Template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CSV Client Migration & Import Wizard"
      subtitle="Migrate existing clients from QuickBooks, Xero, Karbon, or Excel spreadsheets with column validation."
      maxWidth="3xl"
    >
      <div className="space-y-4 pt-1 text-xs">
        {importSummary ? (
          <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-base text-emerald-900">Import Complete</h3>
            <p className="text-emerald-700">{importSummary}</p>
          </div>
        ) : step === 'input' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                <div>
                  <span className="font-bold text-slate-900">Download CSV Column Template</span>
                  <p className="text-[11px] text-slate-500">Includes Company, Contact Name, Email, Type, Country, and Currency.</p>
                </div>
              </div>
              <button
                onClick={downloadSampleTemplate}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-brand-600 font-bold hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Template
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Paste CSV Records or Raw Tabular Data *
              </label>
              <textarea
                rows={7}
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder="Paste CSV rows here with headers..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-[11px] bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={handleParse}
              >
                Review & Validate Columns
              </Button>
            </div>
          </div>
        ) : (
          /* Step 2: Validation Preview & Error Report */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">Validation Preview & Error Report</span>
                <p className="text-slate-500 text-[11px]">
                  {parsedRows.filter(r => r.isValid).length} ready to import •{' '}
                  {parsedRows.filter(r => !r.isValid).length} flagged with validation errors
                </p>
              </div>
              <button
                onClick={() => setStep('input')}
                className="text-xs text-brand-600 hover:underline font-semibold"
              >
                ← Back to CSV input
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Currency</th>
                    <th className="py-2.5 px-3">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'bg-white' : 'bg-rose-50/50'}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{row.company}</td>
                      <td className="py-2 px-3 text-slate-700">{row.name}</td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{row.email}</td>
                      <td className="py-2 px-3 text-slate-600">{row.clientType}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{row.currency}</td>
                      <td className="py-2 px-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200" title={row.error}>
                            <AlertCircle className="w-3 h-3" /> {row.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setStep('input')}>
                Modify CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Check className="w-4 h-4" />}
                onClick={handleConfirmImport}
                disabled={parsedRows.filter(r => r.isValid).length === 0}
              >
                Import {parsedRows.filter(r => r.isValid).length} Valid Clients
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
