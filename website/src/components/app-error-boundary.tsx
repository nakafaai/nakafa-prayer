import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui/button'

type Props = { children: ReactNode }
type State = { failed: boolean }

/**
 * Keeps a render error from leaving a blank page.
 *
 * A class is the only way to catch render errors in React, so this is the one
 * class component in the app. It reloads rather than trying to recover, because
 * the state that caused the failure is not knowable from here.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Nakafa Prayer failed to render', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) {
      return this.props.children
    }

    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-start justify-center gap-4 px-6">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-pretty text-muted-foreground">
          The page could not finish rendering. Reloading usually fixes it.
        </p>
        <Button onClick={() => window.location.reload()}>Reload the page</Button>
      </main>
    )
  }
}
