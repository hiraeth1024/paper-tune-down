'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ToastContextValue {
  showToast: (msg: string) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  const showToast = useCallback((msg: string) => {
    setMsg(msg)
    setVisible(true)
    setTimeout(() => setVisible(false), 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <div className="toast-enter fixed top-16 right-4 sm:right-6 z-[100] bg-pg-text text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium">
          {msg}
        </div>
      )}
    </ToastContext.Provider>
  )
}
