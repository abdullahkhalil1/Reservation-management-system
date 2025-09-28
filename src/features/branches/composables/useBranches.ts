import { ref, computed, readonly } from 'vue'
import { branchService } from '../services/branchService'
import type { Branch, BranchSummary } from '@/shared/types'

// Shared state across all composable instances
const branches = ref<Branch[]>([])
const loading = ref(false) // For data fetching operations (fetch, refresh)
const error = ref<string | null>(null)
const operationLoading = ref(false) // For all branch operations (update, enable, disable)
let fetchPromise: Promise<void> | null = null

export function useBranches() {

  // Computed properties for processed data
  const reservationEnabledBranches = computed<BranchSummary[]>(() => {
    const list = branches.value || []
    return list
      .filter(branch => branch.accepts_reservations && !branch.deleted_at)
      .map(branch => ({
        id: branch.id,
        name: branch.name,
        reference: branch.reference,
        reservation_tables_count: countReservationTables(branch),
        reservation_duration: branch.reservation_duration,
      }))
  })

  const reservationDisabledBranches = computed<Branch[]>(() => {
    const list = branches.value || []
    return list.filter(branch => !branch.accepts_reservations && !branch.deleted_at)
  })

  const activeBranches = computed<Branch[]>(() => {
    const list = branches.value || []
    return list.filter(branch => !branch.deleted_at)
  })

  const totalReservationTables = computed(() => {
    return reservationEnabledBranches.value.reduce(
      (total, branch) => total + branch.reservation_tables_count, 
      0
    )
  })

  const averageDuration = computed(() => {
    const enabledBranches = reservationEnabledBranches.value
    if (enabledBranches.length === 0) return 0
    
    const total = enabledBranches.reduce((sum, branch) => sum + branch.reservation_duration, 0)
    return Math.round(total / enabledBranches.length)
  })

  // Helper functions
  function countReservationTables(branch: Branch): number {
    if (!branch.sections) return 0
    
    return branch.sections.reduce((total, section) => {
      if (!section.tables) return total
      return total + section.tables.filter(table => table.accepts_reservations).length
    }, 0)
  }

  // Actions
  async function fetchAllBranches() {
    // If a fetch is already in progress, return the existing promise
    if (fetchPromise) return fetchPromise

    // If data is already loaded, don't fetch again
    if (branches.value.length > 0) return Promise.resolve()

    loading.value = true
    error.value = null

    fetchPromise = (async () => {
      try {
        const data = await branchService.getAllBranches()
        branches.value = Array.isArray(data) ? data : []
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch branches'
      } finally {
        loading.value = false
        fetchPromise = null
      }
    })()

    return fetchPromise
  }

  async function refreshBranches() {
    branches.value = []
    fetchPromise = null
    return fetchAllBranches()
  }

  /**
   * Enable reservations for multiple branches in bulk.
   * - Runs requests in parallel
   * - Updates local state for each success
   * - Performs a single refresh at the end for consistency
   * - Returns a summary of successes and failures
   */
  async function enableReservationsBulk(branchIds: string[]): Promise<{
    succeededIds: string[]
    failed: { id: string, reason: string }[]
  }> {
    operationLoading.value = true
    try {
      const results = await Promise.allSettled(
        branchIds.map(async (id) => {
          const updatedBranch = await branchService.enableReservations(id)
          const index = branches.value.findIndex(b => b.id === id)
          if (index !== -1) {
            branches.value[index] = updatedBranch
          }
          return id
        })
      )

      const succeededIds: string[] = []
      const failed: { id: string, reason: string }[] = []

      results.forEach((res, idx) => {
        const id = branchIds[idx]
        if (res.status === 'fulfilled') {
          succeededIds.push(id)
        } else {
          const reason = res.reason instanceof Error ? res.reason.message : String(res.reason)
          failed.push({ id, reason })
        }
      })

      try {
        await refreshBranches()
      } catch (refreshErr) {
        // Keep the operation result even if refresh fails; surface error
        error.value = refreshErr instanceof Error ? refreshErr.message : 'Failed to refresh branches after bulk enable'
      }

      return { succeededIds, failed }
    } finally {
      operationLoading.value = false
    }
  }

  async function disableReservations(branchId: string) {
    try {
      const updatedBranch = await branchService.disableReservations(branchId)
      
      // Update local state
      const index = branches.value.findIndex(b => b.id === branchId)
      if (index !== -1) {
        branches.value[index] = updatedBranch
      }
      
      // Refresh branches to ensure consistency
      await refreshBranches()
      
      return updatedBranch
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to disable reservations'
      throw err
    }
  }

  async function disableAllReservations() {
    try {
      const enabledBranches = reservationEnabledBranches.value
      
      // Disable reservations for all enabled branches
      const promises = enabledBranches.map(branch => disableReservations(branch.id))
      await Promise.all(promises)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to disable all reservations'
      throw err
    }
  }

  async function updateReservationSettings(
    branchId: string, 
    settings: {
      accepts_reservations?: boolean
      reservation_duration?: number
      reservation_times?: any
    }
  ): Promise<{ success: boolean; data?: Branch; error?: any }> {
    operationLoading.value = true
    try {
      const updatedBranch = await branchService.updateReservationSettings(branchId, settings)
      
      // Update local state
      const index = branches.value.findIndex(b => b.id === branchId)
      if (index !== -1) {
        branches.value[index] = updatedBranch
      }
      
      // Refresh the data to ensure consistency
      await refreshBranches()
      
      return { success: true, data: updatedBranch }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update reservation settings'
      return { success: false, error: err }
    } finally {
      operationLoading.value = false
    }
  }

  // Internal reset function for testing
  const _resetState = () => {
    branches.value = []
    loading.value = false
    error.value = null
    operationLoading.value = false
    fetchPromise = null
  }

  // Helper function to get a mutable copy of a branch by ID
  const getBranchById = (id: string): Branch | null => {
    const branch = branches.value.find(b => b.id === id)
    return branch ? JSON.parse(JSON.stringify(branch)) : null
  }

  return {
    // State (readonly for external use)
    branches: readonly(branches),
    loading: readonly(loading),
    operationLoading: readonly(operationLoading),
    error: readonly(error),
    
    // Computed
    reservationEnabledBranches,
    reservationDisabledBranches,
    activeBranches,
    totalReservationTables,
    averageDuration,
    
    // Actions
    fetchAllBranches,
    refreshBranches,
    disableReservations,
    disableAllReservations,
    updateReservationSettings,
    enableReservationsBulk,
    
    // Utilities
    getBranchById,
    
    // Testing utilities (only use in tests)
    ...(import.meta.env.MODE === 'test' && { _resetState })
  }
}
