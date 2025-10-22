import React from 'react'
import ReactDom from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'
import { AuthProvider } from './infrastructure/auth/AuthContext.tsx'
import './index.css'
import App from './App.tsx'

ReactDom.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>
)
