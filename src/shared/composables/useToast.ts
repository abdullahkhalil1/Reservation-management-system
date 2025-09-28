import { ref, reactive } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

interface ToastState {
  toasts: Toast[]
}

// Global toast state
const state = reactive<ToastState>({
  toasts: []
})

let toastId = 0

export function useToast() {
  function addToast(toast: Omit<Toast, 'id'>): string {
    const id = `toast-${++toastId}`
    const newToast: Toast = {
      id,
      duration: 5000, // 5 seconds default
      ...toast
    }
    
    state.toasts.push(newToast)
    
    // Auto remove after duration (unless persistent)
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }
  
  function removeToast(id: string) {
    const index = state.toasts.findIndex(toast => toast.id === id)
    if (index > -1) {
      state.toasts.splice(index, 1)
    }
  }
  
  function clearAll() {
    state.toasts.splice(0)
  }
  
  // Convenience methods
  function success(title: string, message?: string, options?: Partial<Toast>) {
    return addToast({ type: 'success', title, message, ...options })
  }
  
  function error(title: string, message?: string, options?: Partial<Toast>) {
    return addToast({ type: 'error', title, message, ...options })
  }
  
  function warning(title: string, message?: string, options?: Partial<Toast>) {
    return addToast({ type: 'warning', title, message, ...options })
  }
  
  function info(title: string, message?: string, options?: Partial<Toast>) {
    return addToast({ type: 'info', title, message, ...options })
  }
  
  return {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
