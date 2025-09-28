<template>
  <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
    {{ label }}
  </label>
  <div class="relative" ref="dropdownRef">
    <!-- Label -->
    
    <!-- Trigger Button -->
    <button
      type="button"
      :class="buttonClasses"
      :disabled="disabled"
      @click="toggleDropdown"
      @keydown="handleKeydown"
    >
      <div class="flex items-center justify-between w-full min-h-4">
        <div class="flex items-center flex-1 min-w-0">
          <slot name="trigger" :selected="modelValue" :multiple="multiple" :isOpen="isOpen">
            <!-- Multi-select display with horizontal scrolling tags -->
            <div v-if="multiple && selectedArray.length > 0" class="flex-1 min-w-0">
              <div class="flex items-center gap-1 overflow-x-auto">
                <span
                  v-for="item in selectedArray"
                  :key="getOptionKey(item)"
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200 flex-shrink-0 group hover:bg-primary-200 transition-colors"
                >
                  <span class="truncate max-w-[120px]">{{ getDisplayValue(item) }}</span>
                  <button
                    type="button"
                    @click.stop="removeItem(item)"
                    class="ml-1 hover:text-primary-600 focus:outline-none focus:text-primary-600 opacity-70 group-hover:opacity-100 transition-opacity"
                    :tabindex="-1"
                    :aria-label="`Remove ${getDisplayValue(item)}`"
                  >
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
            <!-- Single select display -->
            <span v-else-if="!multiple && modelValue" class="block truncate">
              {{ getDisplayValue(modelValue as T) }}
            </span>
            <!-- Placeholder -->
            <span v-else class="block truncate text-gray-500">
              {{ placeholder }}
            </span>
          </slot>
        </div>
        
        <!-- Chevron Icon -->
        <svg
          :class="['h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200', isOpen ? 'rotate-180' : '']"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Dropdown Options -->
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-show="isOpen"
        class="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        role="listbox"
        :aria-multiselectable="multiple"
      >
        <!-- Search Input - Always show when searchable -->
        <div v-if="searchable" class="sticky top-0 z-10 p-3 border-b border-gray-200 bg-gray-50">
          <Input
            ref="searchInputRef"
            v-model="searchQuery"
            type="search"
            size="sm"
            :placeholder="searchPlaceholder"
            @keydown.stop="handleSearchKeydown"
            @click.stop
          >
            <template #leftIcon>
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </Input>
        </div>

        <!-- Options List -->
        <div class="max-h-48 overflow-auto py-1">
          <div
            v-for="(option, index) in filteredOptions"
            :key="getOptionKey(option)"
            :class="[
              'relative cursor-pointer select-none py-2 pr-4 pl-10',
              focusedIndex === index ? 'bg-primary-100 text-primary-900' : 'text-gray-900',
              'hover:bg-primary-100 hover:text-primary-900'
            ]"
            role="option"
            :aria-selected="isSelected(option)"
            @click="selectOption(option)"
            @mouseenter="focusedIndex = index"
          >
            <slot name="option" :option="option" :selected="isSelected(option)" :focused="focusedIndex === index" :multiple="multiple">
              <span
                :class="[
                  isSelected(option) ? 'font-medium' : 'font-normal',
                  'block truncate',
                ]"
              >
                {{ getDisplayValue(option) }}
              </span>
            </slot>
            
            <!-- Check Icon -->
            <span
              v-if="isSelected(option)"
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </span>
          </div>
          
          <!-- Empty state -->
          <div v-if="filteredOptions.length === 0" class="relative cursor-default select-none py-2 px-4 text-gray-700">
            <span v-if="searchQuery.trim()">No results found for "{{ searchQuery }}"</span>
            <span v-else>No options available</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number | boolean | object">
import { ref, computed } from 'vue'
import { useClickOutside } from '@/shared/composables'
import Input from './Input.vue'

interface Props<T> {
  modelValue: T | T[] | null
  options: T[]
  label?: string
  placeholder?: string
  disabled?: boolean
  displayKey?: keyof T | ((item: T) => string)
  valueKey?: keyof T
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  multiple?: boolean
  searchable?: boolean
  searchPlaceholder?: string
}

const props = withDefaults(defineProps<Props<T>>(), {
  placeholder: 'Select an option...',
  disabled: false,
  size: 'md',
  error: false,
  multiple: false,
  searchable: false,
  searchPlaceholder: 'Search...',
})

const emit = defineEmits<{
  'update:modelValue': [value: T | T[] | null]
}>()

// Refs
const searchInputRef = ref<HTMLInputElement>()
const isOpen = ref(false)
const focusedIndex = ref(-1)
const searchQuery = ref('')

// Click outside handling
const { elementRef: dropdownRef } = useClickOutside(() => {
  if (isOpen.value) {
    closeDropdown()
  }
})

// Computed
const selectedArray = computed(() => {
  if (!props.multiple) return []
  if (Array.isArray(props.modelValue)) return props.modelValue
  return props.modelValue ? [props.modelValue] : []
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return props.options
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  const filtered = props.options.filter(option => {
    const displayValue = getDisplayValue(option).toLowerCase()
    return displayValue.includes(query)
  })
  
  return filtered
})

const buttonClasses = computed(() => {
  const base = 'relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-3 text-left shadow-sm border focus:outline-none focus:ring-1 transition-colors duration-200'
  
  const errorClasses = props.error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
    
  const disabledClasses = props.disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'hover:border-gray-400'
    
  const sizes = {
    sm: 'py-1.5 text-sm',
    md: 'py-2 text-sm',
    lg: 'py-3 text-base',
  }
  
  return [base, errorClasses, disabledClasses, sizes[props.size]].join(' ')
})

// Methods
function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

function closeDropdown() {
  isOpen.value = false
  searchQuery.value = ''
}

function selectOption(option: T) {
  if (props.multiple) {
    const currentArray = selectedArray.value
    const isCurrentlySelected = currentArray.some(item => compareItems(item, option))
    
    if (isCurrentlySelected) {
      // Remove item
      const newArray = currentArray.filter(item => !compareItems(item, option))
      emit('update:modelValue', newArray.length > 0 ? newArray : null)
    } else {
      // Add item
      const newArray = [...currentArray, option]
      emit('update:modelValue', newArray)
    }
  } else {
    // Single select
    emit('update:modelValue', option)
    closeDropdown()
  }
}

function removeItem(item: T) {
  if (!props.multiple) return
  
  const currentArray = selectedArray.value
  const newArray = currentArray.filter(arrayItem => !compareItems(arrayItem, item))
  emit('update:modelValue', newArray.length > 0 ? newArray : null)
}

function isSelected(option: T): boolean {
  if (props.multiple) {
    return selectedArray.value.some(item => compareItems(item, option))
  } else {
    return props.modelValue ? compareItems(props.modelValue as T, option) : false
  }
}

function compareItems(item1: T, item2: T): boolean {
  if (props.valueKey && typeof item1 === 'object' && item1 !== null && typeof item2 === 'object' && item2 !== null) {
    return (item1)[props.valueKey] === (item2)[props.valueKey]
  }
  return item1 === item2
}

function getDisplayValue(item: T): string {
  if (!item) return ''
  
  if (typeof props.displayKey === 'function') {
    return props.displayKey(item)
  }
  
  if (props.displayKey && typeof item === 'object' && item !== null) {
    const value = (item as any)[props.displayKey]
    return String(value)
  }
  
  // Fallback: if item is a string, return it; otherwise try to find name/title/label properties
  if (typeof item === 'string') return item
  
  if (typeof item === 'object' && item !== null) {
    const fallbackKeys = ['name', 'title', 'label']
    for (const key of fallbackKeys) {
      if (key in item && (item as any)[key]) {
        return String((item as any)[key])
      }
    }
  }
  
  return String(item)
}

function getOptionKey(option: T): string | number {
  if (props.valueKey && option && typeof option === 'object' && option !== null) {
    const value = (option as any)[props.valueKey]
    return String(value)
  }
  
  // Fallback to common id fields
  const idKeys = ['id', 'value', 'key'] as string[]
  if (option && typeof option === 'object' && option !== null) {
    for (const key of idKeys) {
      if (key in option && (option as any)[key]) {
        return String((option as any)[key])
      }
    }
  }
  
  return getDisplayValue(option)
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      } else if (focusedIndex.value >= 0 && filteredOptions.value[focusedIndex.value]) {
        selectOption(filteredOptions.value[focusedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      } else {
        focusedIndex.value = Math.min(focusedIndex.value + 1, filteredOptions.value.length - 1)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (isOpen.value) {
        focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      }
      break
  }
}

function handleSearchKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, filteredOptions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (focusedIndex.value >= 0 && filteredOptions.value[focusedIndex.value]) {
        selectOption(filteredOptions.value[focusedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
  }
}

</script>

