import React from 'react';

export default function FormField({ label, error, inputProps, as = 'input', children }) {
  const Component = as === 'select' ? 'select' : as === 'textarea' ? 'textarea' : 'input';
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <Component
        {...inputProps}
        className={`w-full rounded-lg border bg-ink-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-signal-500 ${
          error ? 'border-coral-500/60' : 'border-ink-600'
        }`}
      >
        {children}
      </Component>
      {error && <span className="mt-1 block text-xs text-coral-400">{error}</span>}
    </label>
  );
}
