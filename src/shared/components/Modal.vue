<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              :class="modalClasses"
            >
              <div v-if="title" class="flex items-center justify-between p-6 border-b border-gray-200">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  {{ title }}
                </DialogTitle>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500"
                  @click="closeModal"
                >
                  <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div class="p-6">
                <slot />
              </div>

              <div v-if="$slots.footer" class="flex justify-end space-x-2 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-lg">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  isOpen: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{
  close: []
}>()

const modalClasses = computed(() => {
  const base = 'w-full transform rounded-lg bg-white text-left align-middle shadow-xl transition-all'
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
  
  return [base, sizes[props.size]].join(' ')
})

function closeModal() {
  emit('close')
}
</script>
