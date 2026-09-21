import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  tone = 'muted',
  className,
  ...props
}: ComponentProps<'span'> & { tone?: 'muted' | 'primary' }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex h-5 items-center rounded-full px-2 text-[11px] leading-none font-medium whitespace-nowrap',
        tone === 'primary'
          ? 'bg-primary text-primary-foreground'
          : 'border border-border bg-background text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
