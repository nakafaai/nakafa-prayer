import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

export function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/** Bottom sheet on small screens, centered dialog from the small breakpoint up. */
export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="dialog-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'dialog-content fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto overscroll-contain',
          'rounded-t-xl border border-border bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lg outline-none',
          'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(34rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:pb-5',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            'absolute end-3 top-3 inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground',
            'transition-[color,background-color] duration-150 outline-none hover:bg-muted hover:text-foreground',
            'focus-visible:ring-[3px] focus-visible:ring-ring/50',
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-base leading-tight font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
