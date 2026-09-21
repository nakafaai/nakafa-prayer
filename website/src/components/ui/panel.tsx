import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Framed surface for one grouped tool, such as a schedule or a table. */
export function Panel({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="panel"
      className={cn('rounded-lg border border-border bg-muted/40', className)}
      {...props}
    />
  )
}

/** Heading row that names the content of a Panel. */
export function PanelHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="panel-header"
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-3 sm:px-5',
        className,
      )}
      {...props}
    />
  )
}
