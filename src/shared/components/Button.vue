<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-lg',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-lg',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-danger-500 rounded-lg',
    success: 'bg-success-600 hover:bg-success-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-success-500 rounded-lg',
    ghost: 'text-primary-600 hover:text-primary-800 hover:bg-primary-50 focus:ring-2 focus:ring-primary-500 rounded-lg',
    icon: 'text-primary-600 hover:text-primary-800 hover:bg-primary-50 focus:ring-2 focus:ring-primary-500 rounded-full',
  }
  
  const sizes = {
    sm: props.variant === 'icon' ? 'p-1.5' : 'px-3 py-2 text-sm',
    md: props.variant === 'icon' ? 'p-2' : 'px-4 py-2 text-sm',
    lg: props.variant === 'icon' ? 'p-3' : 'px-6 py-3 text-base',
  }
  
  return [base, variants[props.variant], sizes[props.size]].join(' ')
})
</script>
