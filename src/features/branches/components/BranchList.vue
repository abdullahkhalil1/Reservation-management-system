<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Reservation Management</h2>
        <p class="mt-1 text-sm text-gray-600">
          Manage reservation settings across all restaurant branches
        </p>
      </div>
      <div class="flex space-x-3">
        <Button
          variant="secondary"
          @click="showAddBranchModal = true"
        >
          Add Branches
        </Button>
        <Button
          variant="danger"
          :loading="disablingAll"
          @click="handleDisableAll"
        >
          Disable All Reservations
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BuildingStorefrontIcon class="h-8 w-8 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Active Branches
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ reservationEnabledBranches.length }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TableCellsIcon class="h-8 w-8 text-success-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Tables
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ totalReservationTables }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClockIcon class="h-8 w-8 text-orange-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Avg Duration
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ averageDuration }} min
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Branches Table -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Branches</h3>
      </div>
      
      <Table
        :columns="tableColumns"
        :data="reservationEnabledBranches"
        :loading="loading"
        empty-message="No branches have reservations enabled"
        :row-clickable="true"
        @row-click="handleRowClick"
      >
        <template #cell-name="{value}">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>

        <template #cell-reference="{value}">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>

        <template #cell-reservation_tables_count="{ value }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            {{ value }} tables
          </span>
        </template>

        <template #cell-reservation_duration="{ value }">
          <span class="text-sm text-gray-900">{{ value }} minutes</span>
        </template>

        <template #actions="{ item }">
          <div class="flex space-x-2">
            <button
              type="button"
              class="text-primary-600 hover:text-primary-900 text-sm font-medium"
              @click.stop="handleEditBranch(item)"
            >
              Edit
            </button>
            <button
              type="button"
              class="text-danger-600 hover:text-danger-900 text-sm font-medium"
              @click.stop="handleDisableBranch(item)"
            >
              Disable
            </button>
          </div>
        </template>
      </Table>
    </div>

    <!-- Add Branch Modal -->
    <AddBranchModal
      :is-open="showAddBranchModal"
      @close="showAddBranchModal = false"
      @branch-added="handleBranchAdded"
    />

    <!-- Edit Branch Modal -->
    <EditBranchModal
      :is-open="showEditBranchModal"
      :branch="selectedBranch"
      @close="showEditBranchModal = false"
      @branch-updated="handleBranchUpdated"
    />

    <!-- Disable All Confirmation Modal -->
    <ConfirmationModal
      :is-open="showDisableAllModal"
      title="Disable All Reservations"
      message="Are you sure you want to disable reservations for ALL branches?"
      detail="This action will immediately stop accepting new reservations across all your restaurant locations. You can re-enable them individually later."
      confirm-text="Disable All"
      cancel-text="Cancel"
      :loading="disablingAll"
      @confirm="confirmDisableAll"
      @cancel="showDisableAllModal = false"
     />

    <!-- Disable Branch Confirmation Modal -->
    <ConfirmationModal
      :is-open="showDisableBranchModal"
      title="Disable Branch Reservations"
      :message="`Are you sure you want to disable reservations for ${branchToDisable?.name}?`"
      detail="This action will immediately stop accepting new reservations for this branch. You can re-enable them later."
      confirm-text="Disable"
      cancel-text="Cancel"
      :loading="disablingBranch"
      @confirm="confirmDisableBranch"
      @cancel="showDisableBranchModal = false; branchToDisable = null"
     />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBranches } from '@/features/branches/composables/useBranches'
import { useToast } from '@/shared/composables'
import { Button, Table, ConfirmationModal } from '@/shared/components'
import EditBranchModal from './EditBranchModal.vue'
import AddBranchModal from './AddBranchModal.vue'
import type { BranchSummary } from '@/shared/types'
import {
  BuildingStorefrontIcon,
  TableCellsIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'

// Use the composable
const {
  loading,
  reservationEnabledBranches,
  totalReservationTables,
  averageDuration,
  fetchAllBranches,
  disableReservations,
  disableAllReservations,
  getBranchById,
} = useBranches()
const { success, error } = useToast()

// Local state for modals
const showAddBranchModal = ref(false)
const showEditBranchModal = ref(false)
const showDisableAllModal = ref(false)
const showDisableBranchModal = ref(false)
const selectedBranch = ref<BranchSummary | null>(null)
const branchToDisable = ref<BranchSummary | null>(null)
const disablingAll = ref(false)
const disablingBranch = ref(false)

// Table configuration
const tableColumns = [
  { key: 'name', label: 'Branch Name' },
  { key: 'reference', label: 'Reference' },
  { key: 'reservation_tables_count', label: 'Number of Tables' },
  { key: 'reservation_duration', label: 'Reservation Duration' },
]

// Methods
async function loadData() {
  await fetchAllBranches()
}

function handleRowClick(item: any, index: number) {
  handleEditBranch(item as BranchSummary, true)
}

function handleEditBranch(branch: BranchSummary, showErrorToast: boolean = true) {
  // Find the full branch data to check for reservation tables
  const fullBranch = reservationEnabledBranches.value.find(b => b.id === branch.id)
  if (!fullBranch) {
    if (showErrorToast) {
      error('Branch not found', 'Unable to find branch details')
    }
    return
  }

  // Check if branch has any tables that accept reservations
  const branchData = getBranchById(branch.id)
  const hasReservationTables = branchData?.sections?.some((section: any) => 
    section.tables?.some((table: any) => table.accepts_reservations)
  )

  if (!hasReservationTables) {
    if (showErrorToast) {
      error(
        'No Reservation Tables',
        'This branch has no tables configured to accept reservations. Please configure tables first.'
      )
    }
    return
  }

  selectedBranch.value = branch
  showEditBranchModal.value = true
}

function handleDisableBranch(branch: BranchSummary) {
  branchToDisable.value = branch
  showDisableBranchModal.value = true
}

async function confirmDisableBranch() {
  if (!branchToDisable.value) return
  
  disablingBranch.value = true
  try {
    await disableReservations(branchToDisable.value.id)
    showDisableBranchModal.value = false
    
    success(
      'Reservations disabled',
      `Successfully disabled reservations for ${branchToDisable.value.name}`
    )
  } catch (err) {
    error(
      'Failed to disable reservations',
      `Could not disable reservations for ${branchToDisable.value.name}`
    )
  } finally {
    disablingBranch.value = false
    branchToDisable.value = null
  }
}

function handleDisableAll() {
  showDisableAllModal.value = true
}

async function confirmDisableAll() {
  disablingAll.value = true
  try {
    const branchCount = reservationEnabledBranches.value.length
    await disableAllReservations()
    showDisableAllModal.value = false
    
    success(
      'All reservations disabled',
      `Successfully disabled reservations for ${branchCount} branch${branchCount === 1 ? '' : 'es'}`
    )
  } catch (err) {
    console.error('Failed to disable all reservations:', err)
    error(
      'Failed to disable all reservations',
      'An unexpected error occurred. Please try again.'
    )
  } finally {
    disablingAll.value = false
  }
}

function handleBranchAdded() {
  showAddBranchModal.value = false
  loadData()
}

async function handleBranchUpdated() {
  showEditBranchModal.value = false
  selectedBranch.value = null
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>
