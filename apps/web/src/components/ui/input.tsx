import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors',
        'placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
