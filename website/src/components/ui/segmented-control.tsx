import * as ToggleGroup from '@radix-ui/react-toggle-group'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Segmented control for a small set of modes.
 *
 * The container owns the only border so the group reads as one control.
 */
export function SegmentedControl({ className, ...props }: ComponentProps<typeof ToggleGroup.Root>) {
  return (
    <ToggleGroup.Root
      data-slot="segmented-control"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md border border-border bg-muted p-0.5',
        className,
      )}
      {...props}
    />
  )
}

export function SegmentedControlItem({
  className,
  ...props
}: ComponentProps<typeof ToggleGroup.Item>) {
  return (
    <ToggleGroup.Item
      data-slot="segmented-control-item"
      className={cn(
        'inline-flex h-7 min-w-8 items-center justify-center gap-1.5 rounded-sm px-2.5 text-[13px] font-medium',
        'text-muted-foreground transition-[color,background-color,box-shadow] duration-150 outline-none',
        'hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs',
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}
