<template>
  <div class="relative">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <!-- Input container -->
    <div class="relative">
      <!-- Left icon -->
      <div v-if="slots.leftIcon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="leftIcon" />
      </div>
      
      <!-- Input -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        :class="inputClasses"
        v-bind="$attrs"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />
      
      <!-- Right icon -->
      <div v-if="slots.rightIcon" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <slot name="rightIcon" />
      </div>
    </div>
    
    <!-- Error message -->
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
    
    <!-- Help text -->
    <p v-if="helpText && !error" class="mt-1 text-sm text-gray-500">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'time'
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  helpText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  min?: string | number
  max?: string | number
  step?: string | number
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  size: 'md',
  variant: 'default',
  autocomplete: 'off',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'keydown': [event: KeyboardEvent]
}>()

// Generate unique ID for accessibility
const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)
const slots = useSlots()

const inputClasses = computed(() => {
  const base = 'block w-full rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-1'
  
  // Size classes
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  }
  
  // Variant classes
  const variants = {
    default: 'border border-gray-300 bg-white focus:ring-primary-500 focus:border-primary-500',
    filled: 'border-0 bg-gray-100 focus:ring-primary-500 focus:bg-white',
    outlined: 'border-2 border-gray-300 bg-transparent focus:ring-0 focus:border-primary-500',
  }
  
  // State classes
  const stateClasses = []
  
  if (props.disabled) {
    stateClasses.push('opacity-50 cursor-not-allowed bg-gray-50')
  } else if (props.readonly) {
    stateClasses.push('bg-gray-50 cursor-default')
  }
  
  if (props.error) {
    stateClasses.push('border-red-300 focus:border-red-500 focus:ring-red-500')
  }
  
  // Icon padding
  const iconPadding = []
  if (slots.leftIcon) {
    iconPadding.push('pl-10')
  }
  if (slots.rightIcon) {
    iconPadding.push('pr-10')
  }
  
  return [
    base,
    sizes[props.size],
    props.error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : variants[props.variant],
    ...stateClasses,
    ...iconPadding,
  ].join(' ')
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  if (props.type === 'number' && value !== '') {
    value = parseFloat(value)
    if (isNaN(value)) value = target.value
  }
  
  emit('update:modelValue', value)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event)
}
</script>
