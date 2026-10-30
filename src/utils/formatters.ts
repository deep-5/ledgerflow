import { format, parseISO, isValid } from 'date-fns';

export function formatCurrency(amount: number, currency: 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    CAD: 'CA$',
    AUD: 'A$',
  };
  const sym = symbols[currency] || '$';
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateString: string | undefined | null, fmt: string = 'MMM dd, yyyy'): string {
  if (!dateString) return '—';
  try {
    const d = parseISO(dateString);
    if (!isValid(d)) return dateString;
    return format(d, fmt);
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString: string): string {
  try {
    const d = parseISO(dateString);
    if (!isValid(d)) return dateString;
    const diffHours = Math.round((new Date().getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(d, 'MMM dd');
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getStatusColorClass(status: string): { bg: string; text: string; border: string; dot: string } {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
    case 'active':
    case 'approved':
      return {
        bg: 'bg-[#EBFDD8]',
        text: 'text-[#2A6605]',
        border: 'border-[#A7F477]',
        dot: 'bg-[#5DB321]',
      };
    case 'in progress':
    case 'partially paid':
    case 'partially received':
    case 'in review':
    case 'onboarding':
      return {
        bg: 'bg-[#D9EFFA]',
        text: 'text-[#0668B6]',
        border: 'border-[#BCE3F7]',
        dot: 'bg-[#087EDB]',
      };
    case 'waiting for client':
    case 'sent':
    case 'submitted':
    case 'changes requested':
    case 'pending review':
    case 'pending':
      return {
        bg: 'bg-amber-50/80',
        text: 'text-amber-800',
        border: 'border-amber-200/90',
        dot: 'bg-amber-500',
      };
    case 'overdue':
    case 'rejected - reupload required':
    case 'urgent':
    case 'cancelled':
    case 'void':
      return {
        bg: 'bg-rose-50/80',
        text: 'text-rose-700',
        border: 'border-rose-200/90',
        dot: 'bg-rose-500',
      };
    case 'not started':
    case 'draft':
    case 'inactive':
    default:
      return {
        bg: 'bg-[#F3F7FA]',
        text: 'text-[#788596]',
        border: 'border-[#E5EBF0]',
        dot: 'bg-[#9AA6B5]',
      };
  }
}
