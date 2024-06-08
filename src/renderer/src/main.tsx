
// main.tsx or main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react'
import App from './App'
import { ToastProvider } from 'tw-noti';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NextUIProvider>
      <ToastProvider
        maxToasts={1}
        timeout={2000}
        containerClasses='right-12 top-12 h-6'
      >
        <App />
      </ToastProvider>

    </NextUIProvider>
  </React.StrictMode>,
)