/*
 * Applies the stored appearance before the first paint.
 *
 * This has to run as a separate blocking script rather than inline: the hosted
 * runtime serves a `script-src 'self'` Content Security Policy, which blocks
 * inline scripts. Reading the preference here keeps a dark visitor from seeing
 * a white flash while React boots.
 */
;(() => {
  try {
    const stored = localStorage.getItem('nakafa-prayer.theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = stored === 'dark' || ((stored === null || stored === 'system') && prefersDark)

    document.documentElement.classList.toggle('dark', dark)
    document.getElementById('theme-color')?.setAttribute('content', dark ? '#060d18' : '#ffffff')
  } catch {
    /* A blocked storage API only costs the stored preference. */
  }
})()
