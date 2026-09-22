import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Sheet(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

/**
 * Sheet surface.
 *
 * A bottom sheet on small screens and a trailing side sheet from the small
 * breakpoint up. The header stays put and only the body scrolls, so long
 * content can never push the title or the close control out of view.
 */
export function SheetContent({
  className,
  children,
  closeLabel,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { closeLabel: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="sheet-overlay"
        className="sheet-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
      />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'sheet-content fixed z-50 flex flex-col bg-background outline-none',
          'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl border-t border-border shadow-lg',
          'sm:inset-x-auto sm:inset-y-0 sm:end-0 sm:h-full sm:max-h-none sm:w-[26rem] sm:rounded-none sm:border-s sm:border-t-0',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={closeLabel}
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

/** Fixed header. The body below it owns the scrolling. */
export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('shrink-0 border-b border-border px-4 py-4 pe-12 sm:px-5', className)}
      {...props}
    />
  )
}

/** Scrollable body. `min-h-0` is what lets it shrink inside the flex column. */
export function SheetBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5',
        'pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-5',
        className,
      )}
      {...props}
    />
  )
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-base leading-tight font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn('mt-1 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
