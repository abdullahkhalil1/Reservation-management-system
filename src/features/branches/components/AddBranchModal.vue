<template>
  <Modal
    :is-open="isOpen"
    title="Enable Reservations"
    size="md"
    @close="handleClose"
  >
    <div>
      <!-- Branch Selection -->
      <Dropdown
        v-if="availableBranches.length > 0"
        v-model="selectedBranches"
        :options="availableBranches"
        label="Select Branches to Enable Reservations"
        placeholder="Choose branches..."
        :display-key="(branch) => `${branch.name} (${branch.reference})`"
        value-key="id"
        multiple
        searchable
        search-placeholder="Search branches..."
      >

        <template #option="{ option, focused, selected: isSelected, multiple }">
          <div class="flex items-center">
            <BuildingStorefrontIcon 
              :class="[
                focused ? 'text-primary-600' : 'text-gray-400',
                'h-5 w-5 mr-3 flex-shrink-0'
              ]" 
            />
            <div class="flex-1 min-w-0">
              <div 
                :class="[
                  isSelected ? 'font-semibold' : 'font-normal',
                  'text-sm truncate'
                ]"
              >
                {{ option.name }}
              </div>
              <div class="text-xs text-gray-500 truncate">
                {{ option.reference }}
              </div>
            </div>
          </div>
        </template>
      </Dropdown>
      
      <!-- Loading state -->
      <div v-else class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Select Branches to Enable Reservations
        </label>
        <div class="flex items-center justify-center py-4 text-gray-500">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
          Loading branches...
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        variant="secondary"
        @click="handleClose"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        :loading="operationLoading"
        :disabled="!selectedBranches || selectedBranchesArray.length === 0"
        @click="handleSubmit"
      >
        Enable {{ selectedBranchesArray.length > 0 ? `${selectedBranchesArray.length} Branch${selectedBranchesArray.length === 1 ? '' : 'es'}` : 'Reservations' }}
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBranches } from '@/features/branches/composables/useBranches'
import { useToast } from '@/shared/composables'
import { Modal, Button, Dropdown } from '@/shared/components'
import { BuildingStorefrontIcon } from '@heroicons/vue/24/outline'
import type { Branch } from '@/shared/types'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  branchAdded: []
}>()

const { reservationDisabledBranches, enableReservationsBulk, fetchAllBranches, operationLoading } = useBranches()
const { success, error } = useToast()

// Form state
const selectedBranches = ref<Branch[] | null>(null)

// Computed
const availableBranches = computed(() => reservationDisabledBranches.value)

const selectedBranchesArray = computed(() => {
  if (!selectedBranches.value) return []
  if (Array.isArray(selectedBranches.value)) return selectedBranches.value
  return [selectedBranches.value]
})

async function handleSubmit() {
  const branchesToEnable = selectedBranchesArray.value
  if (branchesToEnable.length === 0) return

  try {
    const { succeededIds, failed } = await enableReservationsBulk(branchesToEnable.map(b => b.id))

    if (failed.length > 0) {
      // Show error toast for failed branches
      const branchNames = failed.map(f => {
        const branch = branchesToEnable.find(b => b.id === f.id)
        return branch?.name || f.id
      }).join(', ')
      
      error(
        `Failed to enable ${failed.length} branch${failed.length === 1 ? '' : 'es'}`,
        `Could not enable reservations for: ${branchNames}`
      )
    }

    if (succeededIds.length > 0) {
      // Show success toast for successful branches
      const successBranchNames = succeededIds.map(id => {
        const branch = branchesToEnable.find(b => b.id === id)
        return branch?.name || id
      }).join(', ')
      
      success(
        `Successfully enabled ${succeededIds.length} branch${succeededIds.length === 1 ? '' : 'es'}`,
        `Reservations enabled for: ${successBranchNames}`
      )
    }

    emit('branchAdded')
    resetForm()
  } catch (err) {
    error(
      'Failed to enable reservations',
      'An unexpected error occurred. Please try again.'
    )
  }
}

function handleClose() {
  resetForm()
  emit('close')
}

function resetForm() {
  selectedBranches.value = null
}

// Watch for modal open to load available branches
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await fetchAllBranches()
  }
})
</script>
