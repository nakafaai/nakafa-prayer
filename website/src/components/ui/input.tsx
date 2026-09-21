import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Text field. Sixteen pixels on mobile keeps iOS from zooming the page. */
export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'h-9 w-full rounded-md border border-border bg-background px-3 text-base outline-none',
        'transition-[background-color,border-color,box-shadow] duration-150',
        'placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:opacity-50 sm:text-sm',
        className,
      )}
      {...props}
    />
  )
}
