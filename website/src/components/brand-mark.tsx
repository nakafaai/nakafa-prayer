import { cn } from '@/lib/utils'

/** Nakafa Prayer crescent mark, tinted from the primary token. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground',
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-5" fill="none">
        <mask id="brand-crescent">
          <rect width="32" height="32" fill="#ffffff" />
          <circle cx="21.5" cy="13.5" r="8.5" fill="#000000" />
        </mask>
        <circle cx="16" cy="16" r="9" fill="currentColor" mask="url(#brand-crescent)" />
        <circle cx="24" cy="9" r="1.7" fill="currentColor" />
      </svg>
    </span>
  )
}
