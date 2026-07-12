import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Self-hosted fonts (bundled by Vite — no CDN request, renders identically everywhere)
import '@fontsource/anton'                 // Anton 400 (display — only weight Anton has)
import '@fontsource/archivo/400.css'       // body
import '@fontsource/archivo/500.css'       // statement
import '@fontsource/archivo/600.css'       // card titles
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'

import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
