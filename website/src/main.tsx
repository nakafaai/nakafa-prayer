import '@fontsource-variable/inter'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('The root container is missing from index.html')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
