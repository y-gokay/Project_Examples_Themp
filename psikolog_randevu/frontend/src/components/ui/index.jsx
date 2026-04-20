import { forwardRef, useEffect } from 'react';

const cx = (...parts) => parts.filter(Boolean).join(' ');

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...rest },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: {
      background: 'rgb(var(--accent))',
      color: 'white',
    },
    secondary: {
      background: 'rgb(var(--bg-elev))',
      border: '1.5px solid rgba(var(--border))',
      color: 'rgb(var(--text-1))',
    },
    ghost: {
      background: 'transparent',
      color: 'rgb(var(--text-2))',
    },
    danger: {
      background: '#e53e3e',
      color: 'white',
    },
    subtle: {
      background: 'rgba(var(--accent), 0.10)',
      color: 'rgb(var(--accent))',
    },
  };

  return (
    <button
      ref={ref}
      className={cx(base, sizes[size], className)}
      style={variantStyles[variant]}
      onMouseEnter={(e) => {
        if (variant === 'primary') e.currentTarget.style.filter = 'brightness(1.08)';
        if (variant === 'ghost') e.currentTarget.style.background = 'rgba(var(--accent), 0.07)';
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') e.currentTarget.style.filter = '';
        if (variant === 'ghost') e.currentTarget.style.background = 'transparent';
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export const Card = ({ className = '', children, ...rest }) => (
  <div className={cx('card', className)} {...rest}>
    {children}
  </div>
);

const BADGE_STYLES = {
  pending:   { bg: 'rgba(245,158,11,0.10)',  color: '#d97706', border: 'rgba(245,158,11,0.25)' },
  approved:  { bg: 'rgba(16,185,129,0.10)',  color: '#059669', border: 'rgba(16,185,129,0.25)' },
  rejected:  { bg: 'rgba(239,68,68,0.10)',   color: '#dc2626', border: 'rgba(239,68,68,0.25)' },
  cancelled: { bg: 'rgba(113,113,122,0.12)', color: '#71717a', border: 'rgba(113,113,122,0.28)' },
  completed: { bg: 'rgba(139,92,246,0.12)',  color: '#7c3aed', border: 'rgba(139,92,246,0.28)' },
  neutral:   { bg: 'rgba(var(--border))',     color: 'rgb(var(--text-2))', border: 'rgba(var(--border))' },
  accent:    { bg: 'rgba(var(--accent),0.10)',color: 'rgb(var(--accent))', border: 'rgba(var(--accent),0.25)' },
};

export const Badge = ({ tone = 'neutral', className = '', children }) => {
  const s = BADGE_STYLES[tone] || BADGE_STYLES.neutral;
  return (
    <span
      className={cx('inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border', className)}
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {children}
    </span>
  );
};

export const Input = forwardRef(function Input({ className = '', ...rest }, ref) {
  return <input ref={ref} className={cx('input-field', className)} {...rest} />;
});

export const Textarea = forwardRef(function Textarea({ className = '', rows = 4, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={cx('input-field resize-y', className)} {...rest} />;
});

export const Tabs = ({ tabs, value, onChange, className = '', direction = 'horizontal' }) => {
  const vertical = direction === 'vertical';
  return (
    <div
      className={cx(
        vertical ? 'flex flex-col p-1 rounded-xl gap-1 w-full' : 'inline-flex p-1 rounded-xl gap-1',
        className,
      )}
      role="tablist"
      style={{ background: 'rgba(var(--accent), 0.08)' }}
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cx(
              'px-3.5 py-1.5 text-sm font-bold rounded-lg transition-all duration-200 text-left',
              vertical && 'w-full',
            )}
            style={
              active
                ? { background: 'rgb(var(--bg-elev))', color: 'rgb(var(--accent))', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                : { background: 'transparent', color: 'rgb(var(--text-2))' }
            }
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className="ml-1.5 text-xs opacity-60">{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center text-center py-14 px-6">
    {icon && (
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(var(--accent), 0.10)', color: 'rgb(var(--accent))' }}
      >
        {icon}
      </div>
    )}
    <h3 className="text-base font-bold mb-1" style={{ color: 'rgb(var(--text-1))' }}>
      {title}
    </h3>
    {description && (
      <p className="text-sm max-w-md" style={{ color: 'rgb(var(--text-2))' }}>
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Dialog = ({ open, onClose, title, description, children, footer }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl animate-scale-in"
        style={{
          background: 'rgb(var(--bg-elev))',
          borderColor: 'rgba(var(--border))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-bold" style={{ color: 'rgb(var(--text-1))' }}>
            {title}
          </h3>
          {description && (
            <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-2))' }}>
              {description}
            </p>
          )}
        </div>
        <div className="px-5 pb-4">{children}</div>
        {footer && (
          <div
            className="px-5 py-3 flex justify-end gap-2 rounded-b-2xl border-t"
            style={{
              borderColor: 'rgba(var(--border))',
              background: 'rgba(var(--bg-muted))',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export { cx };
