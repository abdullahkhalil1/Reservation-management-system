<template>
  <Modal
    :is-open="isOpen"
    :title="title"
    size="sm"
    @close="handleCancel"
  >
    <div class="space-y-4">
      <!-- Icon -->
      <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
        <ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
      </div>
      
      <!-- Message -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          {{ message }}
        </p>
        <p v-if="detail" class="text-xs text-gray-500 mt-2">
          {{ detail }}
        </p>
      </div>
      
      <!-- Additional content slot -->
      <div v-if="$slots.default" class="mt-4">
        <slot />
      </div>
    </div>

    <template #footer>
      <Button
        variant="secondary"
        @click="handleCancel"
        :disabled="loading"
      >
        {{ cancelText }}
      </Button>
      <Button
        variant="danger"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue'
import Button from './Button.vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

interface Props {
  isOpen: boolean
  title: string
  message: string
  detail?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>
