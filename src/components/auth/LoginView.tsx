import React, { useState } from 'react';
import {
  Layers,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  KeyRound,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { allUsers, workspaceSettings } = useApp();

  const [activeTab, setActiveTab] = useState<'staff' | 'client'>('staff');
  const [email, setEmail] = useState('eleanor.vance@apexadvisory.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isMagicLink) {
      setMagicLinkSent(true);
      return;
    }

    const found = allUsers.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (found) {
      onLoginSuccess(found);
    } else {
      setErrorMessage('Invalid credentials. Check your email or use one of the demo logins below.');
    }
  };

  const handleQuickDemoLogin = (user: User) => {
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-[#E2F0F6] flex flex-col justify-between text-[#202938]">
      {/* Top Banner */}
      <div className="bg-[#D9EFFA] border-b border-[#BCE3F7] py-2.5 px-4 text-center text-xs text-[#0668B6] font-medium">
        <span className="font-bold">Demo Workspace Active:</span> {workspaceSettings.firmName} • Click any role pill below to authenticate instantly.
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-[#E5EBF0] shadow-card">
              <div className="w-7 h-7 rounded-xl bg-[#087EDB] text-white flex items-center justify-center font-extrabold text-sm shadow-xs border border-[#0668B6]">
                LF
              </div>
              <span className="font-extrabold text-[#202938] tracking-tight text-base">LedgerFlow</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#202938]">
              {activeTab === 'staff' ? 'Sign in to your practice' : 'Client Secure Portal Login'}
            </h1>
            <p className="text-xs text-[#788596]">
              {activeTab === 'staff'
                ? 'Accounting practice operations, deadlines, and client workflows.'
                : 'Submit requested financial documents and review service invoices.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#F3F7FA] p-1 rounded-2xl border border-[#E5EBF0] text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('staff');
                setEmail('eleanor.vance@apexadvisory.com');
                setIsMagicLink(false);
                setMagicLinkSent(false);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeTab === 'staff'
                  ? 'bg-white text-[#087EDB] font-bold shadow-sm'
                  : 'text-[#788596] hover:text-[#202938]'
              }`}
            >
              Practice Staff
            </button>
            <button
              onClick={() => {
                setActiveTab('client');
                setEmail('j.sterling@sterlinghealth.com');
                setMagicLinkSent(false);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeTab === 'client'
                  ? 'bg-white text-[#087EDB] font-bold shadow-sm'
                  : 'text-[#788596] hover:text-[#202938]'
              }`}
            >
              Client Portal
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EBF0] shadow-card space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {magicLinkSent ? (
              <div className="p-5 bg-[#EBFDD8] border border-[#A7F477] rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#2A6605] mx-auto" />
                <h3 className="font-bold text-sm text-[#2A6605]">Magic Link Sent!</h3>
                <p className="text-xs text-[#2A6605] leading-relaxed">
                  We sent a one-time secure sign-in link to <strong>{email}</strong>. No password needed.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || allUsers[allUsers.length - 2];
                      onLoginSuccess(user);
                    }}
                    className="px-4 py-2 bg-[#087EDB] text-white rounded-xl text-xs font-bold hover:bg-[#0668B6]"
                  >
                    Simulate Clicking Magic Link →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleStandardSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#202938] mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#788596] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@firm.com"
                      className="w-full pl-9 pr-3.5 py-2.5 border border-[#E5EBF0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20 focus:border-[#087EDB] bg-white text-[#202938]"
                    />
                  </div>
                </div>

                {!isMagicLink && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-[#202938]">Password</label>
                      <button
                        type="button"
                        onClick={() => alert('In demo mode, you can use any password or click the instant demo role pills below.')}
                        className="text-[11px] text-[#087EDB] hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#788596] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-9 py-2.5 border border-[#E5EBF0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20 focus:border-[#087EDB] bg-white text-[#202938]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-[#788596] hover:text-[#202938] absolute right-2.5 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'client' && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isMagicLink}
                      onChange={e => setIsMagicLink(e.target.checked)}
                      className="rounded border-[#E5EBF0] text-[#087EDB] focus:ring-[#087EDB]/20"
                    />
                    <span className="text-[#788596] font-medium">Use passwordless Magic Link login</span>
                  </label>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#087EDB] hover:bg-[#0668B6] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] border border-[#0668B6]"
                >
                  <span>{isMagicLink ? 'Send Secure Magic Link' : 'Sign in to LedgerFlow'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* One-Click Demo Role Pills (Section 21) */}
          <div className="bg-[#F3F7FA] p-4 rounded-2xl border border-[#E5EBF0] space-y-2.5">
            <div className="flex items-center justify-between text-[#788596] text-[11px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#087EDB]" />
                Instant Demo Logins
              </span>
              <span className="text-[#788596] font-normal">Click to switch</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {allUsers.map(user => {
                const isClient = user.role === 'Client';
                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickDemoLogin(user)}
                    className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] shadow-xs ${
                      isClient
                        ? 'bg-[#EBFDD8] border-[#A7F477] hover:bg-[#dffac4]'
                        : 'bg-white border-[#E5EBF0] hover:border-[#087EDB]'
                    }`}
                  >
                    <div className="font-bold text-[#202938] truncate text-[11px]">{user.name}</div>
                    <div className={`text-[10px] font-semibold truncate ${isClient ? 'text-[#2A6605]' : 'text-[#087EDB]'}`}>
                      {user.role} {isClient ? '• Portal' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 border-t border-[#E5EBF0] text-center text-xs text-[#788596]">
        LedgerFlow Operations Platform • Multi-Tenant Accounting Practice Management
      </footer>
    </div>
  );
};
