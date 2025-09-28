<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
    <TransitionGroup
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 translate-y-2"
      move-class="transition-transform duration-300"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="toastClasses(toast.type)"
        class="relative rounded-lg shadow-lg p-4 pointer-events-auto"
      >
        <div class="flex items-start">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <CheckCircleIcon
              v-if="toast.type === 'success'"
              class="h-5 w-5 text-green-400"
            />
            <ExclamationCircleIcon
              v-else-if="toast.type === 'error'"
              class="h-5 w-5 text-red-400"
            />
            <ExclamationTriangleIcon
              v-else-if="toast.type === 'warning'"
              class="h-5 w-5 text-yellow-400"
            />
            <InformationCircleIcon
              v-else-if="toast.type === 'info'"
              class="h-5 w-5 text-blue-400"
            />
          </div>
          
          <!-- Content -->
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium" :class="titleClasses(toast.type)">
              {{ toast.title }}
            </p>
            <p
              v-if="toast.message"
              class="mt-1 text-sm"
              :class="messageClasses(toast.type)"
            >
              {{ toast.message }}
            </p>
          </div>
          
          <!-- Close button -->
          <div class="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              class="rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="closeButtonClasses(toast.type)"
              @click="removeToast(toast.id)"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/shared/composables'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const { toasts, removeToast } = useToast()

function toastClasses(type: string) {
  const baseClasses = 'bg-white border'
  
  switch (type) {
    case 'success':
      return `${baseClasses} border-green-200`
    case 'error':
      return `${baseClasses} border-red-200`
    case 'warning':
      return `${baseClasses} border-yellow-200`
    case 'info':
      return `${baseClasses} border-blue-200`
    default:
      return `${baseClasses} border-gray-200`
  }
}

function titleClasses(type: string) {
  switch (type) {
    case 'success':
      return 'text-green-800'
    case 'error':
      return 'text-red-800'
    case 'warning':
      return 'text-yellow-800'
    case 'info':
      return 'text-blue-800'
    default:
      return 'text-gray-800'
  }
}

function messageClasses(type: string) {
  switch (type) {
    case 'success':
      return 'text-green-700'
    case 'error':
      return 'text-red-700'
    case 'warning':
      return 'text-yellow-700'
    case 'info':
      return 'text-blue-700'
    default:
      return 'text-gray-700'
  }
}

function closeButtonClasses(type: string) {
  const baseClasses = 'focus:ring-offset-2'
  
  switch (type) {
    case 'success':
      return `${baseClasses} text-green-400 hover:text-green-500 focus:ring-green-500`
    case 'error':
      return `${baseClasses} text-red-400 hover:text-red-500 focus:ring-red-500`
    case 'warning':
      return `${baseClasses} text-yellow-400 hover:text-yellow-500 focus:ring-yellow-500`
    case 'info':
      return `${baseClasses} text-blue-400 hover:text-blue-500 focus:ring-blue-500`
    default:
      return `${baseClasses} text-gray-400 hover:text-gray-500 focus:ring-gray-500`
  }
}
</script>
