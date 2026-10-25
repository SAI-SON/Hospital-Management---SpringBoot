export default function Badge({ status, text, size = 'md' }) {
  const normalized = (status || text || '').toUpperCase();

  const styles = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
    COMPLETED: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-800',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
    NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
    SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
    PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  };

  const currentStyle = styles[normalized] || 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeStyle} ${currentStyle}`}>
      {text || normalized.replace('_', ' ')}
    </span>
  );
}
