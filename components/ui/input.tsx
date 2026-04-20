import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-midnight placeholder:text-slate-400 focus:border-midnight focus:outline-none focus:ring-2 focus:ring-midnight/20 disabled:bg-slate-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1 block text-xs font-medium uppercase tracking-wide text-slate-deep/70", className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-midnight placeholder:text-slate-400 focus:border-midnight focus:outline-none focus:ring-2 focus:ring-midnight/20",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-midnight focus:border-midnight focus:outline-none focus:ring-2 focus:ring-midnight/20",
        className,
      )}
      {...props}
    />
  );
}
