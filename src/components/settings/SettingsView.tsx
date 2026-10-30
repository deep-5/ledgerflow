import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Palette,
  Users,
  Shield,
  Layers,
  CheckSquare,
  FileCheck,
  Receipt,
  DollarSign,
  Globe,
  Bell,
  Cpu,
  History,
  CheckCircle2,
  Save,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { formatDate, formatTimeAgo } from '../../utils/formatters';

export const SettingsView: React.FC = () => {
  const {
    workspaceSettings,
    updateWorkspaceSettings,
    auditLogs,
    resetDemoData,
    allUsers,
  } = useApp();

  type SettingsTab =
    | 'profile'
    | 'branding'
    | 'services'
    | 'invoices'
    | 'currencies'
    | 'integrations'
    | 'audit';

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [savedNotice, setSavedNotice] = useState(false);

  // Form states
  const [firmName, setFirmName] = useState(workspaceSettings.firmName);
  const [legalEntity, setLegalEntity] = useState(workspaceSettings.legalEntityName);
  const [taxNumber, setTaxNumber] = useState(workspaceSettings.taxRegistrationNumber);
  const [currency, setCurrency] = useState(workspaceSettings.defaultCurrency);
  const [jurisdiction, setJurisdiction] = useState(workspaceSettings.defaultJurisdiction);
  const [timeZone, setTimeZone] = useState(workspaceSettings.timeZone);
  const [remindDays, setRemindDays] = useState(workspaceSettings.autoRemindDaysBeforeDue);
  const [emailNotifs, setEmailNotifs] = useState(workspaceSettings.emailNotifications);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspaceSettings({
      firmName,
      legalEntityName: legalEntity,
      taxRegistrationNumber: taxNumber,
      defaultCurrency: currency,
      defaultJurisdiction: jurisdiction,
      timeZone,
      autoRemindDaysBeforeDue: Number(remindDays),
      emailNotifications: emailNotifs,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202938]">Firm Settings & Administration</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7]">
              Workspace Config
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#788596] mt-0.5">
            Configure legal entity details, billing rates, localization, integration connections, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-xs font-bold text-[#2A6605] flex items-center gap-1 bg-[#EBFDD8] px-2.5 py-1 rounded-xl border border-[#A7F477]">
              <CheckCircle2 className="w-4 h-4 text-[#5DB321]" /> Preferences Saved
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={resetDemoData}
            title="Reset modified clients and tasks back to fresh demonstration state"
          >
            Reset Demo Data
          </Button>
        </div>
      </div>

      {/* Settings Layout: Left Navigation + Right Content Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden min-h-[600px]">
        {/* Left Tab navigation (3 cols) */}
        <div className="md:col-span-3 border-r border-[#E5EBF0] p-3.5 space-y-1 bg-[#F3F7FA]">
          <div className="text-[10px] font-bold text-[#788596] uppercase tracking-wider px-3 py-2">
            Practice Preferences
          </div>

          {[
            { id: 'profile', label: 'Workspace Profile', icon: <Building2 className="w-4 h-4" /> },
            { id: 'branding', label: 'Firm Branding', icon: <Palette className="w-4 h-4" /> },
            { id: 'services', label: 'Service Packages', icon: <Layers className="w-4 h-4" /> },
            { id: 'invoices', label: 'Invoice & Tax Settings', icon: <Receipt className="w-4 h-4" /> },
            { id: 'currencies', label: 'Currencies & Locale', icon: <Globe className="w-4 h-4" /> },
            { id: 'integrations', label: 'Software Integrations', icon: <Cpu className="w-4 h-4" /> },
            { id: 'audit', label: 'Immutable Audit Log', icon: <History className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#087EDB] shadow-sm border border-[#E5EBF0] font-bold'
                  : 'text-[#788596] hover:text-[#202938] hover:bg-white/60 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Area (9 cols) */}
        <div className="md:col-span-9 p-6">
          {/* TAB 1: WORKSPACE PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs max-w-2xl">
              <div>
                <h3 className="font-bold text-base text-[#202938] tracking-tight">Practice Profile</h3>
                <p className="text-[#788596] mt-0.5">
                  Business name and legal registrations shown on client invoices and portal.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block font-bold text-[#202938] mb-1">
                    Practice Trading Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firmName}
                    onChange={e => setFirmName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#E5EBF0] rounded-xl text-xs font-semibold text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20 focus:border-[#087EDB]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202938] mb-1">
                    Registered Legal Entity Name
                  </label>
                  <input
                    type="text"
                    value={legalEntity}
                    onChange={e => setLegalEntity(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#E5EBF0] rounded-xl text-xs text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202938] mb-1">
                    Tax / VAT Registration Numbers
                  </label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={e => setTaxNumber(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#E5EBF0] rounded-xl text-xs font-mono text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202938] mb-1">
                    Primary Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={e => setJurisdiction(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#E5EBF0] rounded-xl text-xs text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#202938] mb-1">
                    Auto-Remind Client (Days before document deadline)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={remindDays}
                    onChange={e => setRemindDays(parseFloat(e.target.value))}
                    className="w-32 px-3.5 py-2 border border-[#E5EBF0] rounded-xl text-xs text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5EBF0] flex justify-end">
                <Button variant="primary" size="sm" type="submit" icon={<Save className="w-4 h-4" />}>
                  Save Workspace Profile
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-5 text-xs max-w-2xl">
              <div>
                <h3 className="font-bold text-base text-[#202938] tracking-tight">Firm White-Label Branding</h3>
                <p className="text-[#788596] mt-0.5">
                  Visual presentation for client portal and outgoing PDF invoices.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 bg-[#F3F7FA] border border-[#E5EBF0] rounded-2xl space-y-3">
                  <span className="font-bold text-[#202938] block">Active Color Palette:</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E5EBF0]">
                      <div className="w-7 h-7 rounded-lg bg-[#087EDB] border border-[#0668B6] shadow-xs" />
                      <div>
                        <p className="font-bold text-[#202938]">Primary Blue</p>
                        <p className="text-[10px] text-[#788596]">#087EDB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E5EBF0]">
                      <div className="w-7 h-7 rounded-lg bg-[#A7F477] border border-[#5DB321] shadow-xs" />
                      <div>
                        <p className="font-bold text-[#202938]">Lime Highlight</p>
                        <p className="text-[10px] text-[#788596]">#A7F477</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E5EBF0]">
                      <div className="w-7 h-7 rounded-lg bg-[#E2F0F6] border border-[#BCE3F7] shadow-xs" />
                      <div>
                        <p className="font-bold text-[#202938]">Soft Blue Canvas</p>
                        <p className="text-[10px] text-[#788596]">#E2F0F6</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E5EBF0]">
                      <div className="w-7 h-7 rounded-lg bg-[#D9EFFA] border border-[#BCE3F7] shadow-xs" />
                      <div>
                        <p className="font-bold text-[#202938]">Secondary Card</p>
                        <p className="text-[10px] text-[#788596]">#D9EFFA</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#202938] mb-1">Client Portal Subdomain Slug</label>
                  <div className="flex items-center">
                    <span className="px-3.5 py-2 bg-[#F3F7FA] border border-r-0 border-[#E5EBF0] rounded-l-xl text-[#788596] text-xs font-medium">
                      https://
                    </span>
                    <input
                      type="text"
                      defaultValue="apex-advisory"
                      className="px-3.5 py-2 border border-[#E5EBF0] text-xs focus:outline-none font-semibold text-[#202938]"
                    />
                    <span className="px-3.5 py-2 bg-[#F3F7FA] border border-l-0 border-[#E5EBF0] rounded-r-xl text-[#788596] text-xs font-medium">
                      .ledgerflow.io
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-5 text-xs">
              <div>
                <h3 className="font-bold text-base text-slate-900 tracking-tight">Standard Client Service Templates</h3>
                <p className="text-slate-500 mt-0.5">
                  Configured service scopes applied to clients during onboarding.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'Monthly Bookkeeping Retainer', fee: '$1,800 - $3,500/mo', desc: 'Bank reconciliation, accounts payable matching, month-end ledger close.' },
                  { name: 'Payroll Operations & Multi-State Tax', fee: '$250/run + $10/employee', desc: 'Direct deposit processing, W-2 staging, state quarterly unemployment filings.' },
                  { name: 'UK VAT Preparation & MTD Staging', fee: '£350/quarter', desc: 'Making Tax Digital cross-border SaaS reverse-charge verification.' },
                  { name: 'Advisory & Cash Flow Forecasting', fee: '$200/hr', desc: '13-week rolling liquidity model, fractional controller guidance.' },
                ].map((srv, idx) => (
                  <div key={idx} className="p-4 bg-white border border-[#E5EBF0] rounded-2xl flex items-center justify-between hover:border-[#087EDB]/50 transition-all shadow-card">
                    <div>
                      <span className="font-bold text-[#202938]">{srv.name}</span>
                      <p className="text-[11px] text-[#788596] mt-0.5">{srv.desc}</p>
                    </div>
                    <span className="font-mono font-bold text-[#087EDB] bg-[#D9EFFA] px-2.5 py-1 rounded-xl border border-[#BCE3F7]">
                      {srv.fee}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-5 text-xs max-w-2xl">
              <div>
                <h3 className="font-bold text-base text-[#202938] tracking-tight">Invoice & Remittance Settings</h3>
                <p className="text-[#788596] mt-0.5">
                  Tax treatment configuration and default payment instructions.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block font-bold text-[#202938] mb-1">Default Tax Treatment</label>
                  <select
                    className="w-full px-3.5 py-2 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
                    defaultValue="us_exempt"
                  >
                    <option value="us_exempt">United States — Non-Taxable Professional Services (0%)</option>
                    <option value="uk_vat">United Kingdom — Standard VAT (20%)</option>
                    <option value="eu_vat">European Union — Reverse Charge Rules Apply</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202938] mb-1">Standard Payment Terms</label>
                  <select className="w-full px-3.5 py-2 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20" defaultValue="net15">
                    <option value="due">Due on Receipt</option>
                    <option value="net15">Net 15 Days</option>
                    <option value="net30">Net 30 Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CURRENCIES & LOCALE */}
          {activeTab === 'currencies' && (
            <div className="space-y-5 text-xs max-w-2xl">
              <div>
                <h3 className="font-bold text-base text-[#202938] tracking-tight">Currencies & Multi-Entity Localization</h3>
                <p className="text-[#788596] mt-0.5">
                  Support international clients in North America, United Kingdom, and Europe.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block font-bold text-[#202938] mb-1">Default Practice Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
                  >
                    <option value="USD">USD — United States Dollar ($)</option>
                    <option value="GBP">GBP — British Pound (£)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                    <option value="CAD">CAD — Canadian Dollar (CA$)</option>
                    <option value="AUD">AUD — Australian Dollar (A$)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#202938] mb-1">Practice Primary Time Zone</label>
                  <input
                    type="text"
                    value={timeZone}
                    onChange={e => setTimeZone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#E5EBF0] rounded-xl text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-5 text-xs">
              <div>
                <h3 className="font-bold text-base text-[#202938] tracking-tight">External Ecosystem Integrations</h3>
                <p className="text-[#788596] mt-0.5">
                  LedgerFlow is designed to connect directly with general ledgers, tax authorities, and payment gateways.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[
                  { name: 'Xero Accounting', type: 'General Ledger Sync', status: 'Connected', desc: 'Sync chart of accounts and invoice lines.' },
                  { name: 'QuickBooks Online', type: 'General Ledger Sync', status: 'Ready to Connect', desc: 'Bi-directional bank feed journal entries.' },
                  { name: 'Stripe Billing & ACH', type: 'Payment Processor', status: 'Connected', desc: 'Direct client portal debit and credit card processing.' },
                  { name: 'HMRC Making Tax Digital (MTD)', type: 'Tax Authority API', status: 'Authorized', desc: 'Direct UK VAT 100 return verification submission.' },
                  { name: 'IRS Modernized e-File (MeF)', type: 'Tax Authority API', status: 'Staged', desc: 'Corporate Form 1120 and Form 1065 staging.' },
                ].map((integ, idx) => (
                  <div key={idx} className="p-4 bg-white border border-[#E5EBF0] rounded-2xl space-y-2 hover:border-[#087EDB]/50 transition-all shadow-card">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#202938] text-sm">{integ.name}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          integ.status === 'Connected' || integ.status === 'Authorized'
                            ? 'bg-[#EBFDD8] text-[#2A6605] border border-[#A7F477]'
                            : 'bg-[#F3F7FA] text-[#788596] border border-[#E5EBF0]'
                        }`}
                      >
                        {integ.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#087EDB] block">{integ.type}</span>
                    <p className="text-[11px] text-[#788596]">{integ.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-5 text-xs">
              <div>
                <h3 className="font-bold text-base text-[#202938] tracking-tight">Security & Accounting Audit Trail</h3>
                <p className="text-[#788596] mt-0.5">
                  Immutable record of user actions, file approvals, status changes, and client portal access.
                </p>
              </div>

              <div className="border border-[#E5EBF0] rounded-2xl overflow-hidden divide-y divide-[#E5EBF0] bg-white shadow-card">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3.5 flex items-start justify-between gap-4 hover:bg-[#F3F7FA] transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#202938]">{log.action}</span>
                        <span className="px-2 py-0.5 bg-[#F3F7FA] text-[#202938] rounded-full text-[10px] font-semibold border border-[#E5EBF0]">
                          {log.category}
                        </span>
                      </div>
                      <p className="text-[#202938] text-[11px] leading-relaxed">{log.details}</p>
                      <p className="text-[10px] text-[#788596]">
                        By {log.performedBy} • IP: {log.ipAddress || '127.0.0.1'}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#788596] font-medium whitespace-nowrap">
                      {formatDate(log.timestamp, 'MMM dd, HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
