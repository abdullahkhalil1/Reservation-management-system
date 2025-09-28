import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { nextTick } from 'vue'
import { useBranches } from '../useBranches'
import { branchService } from '../../services/branchService'
import type { Branch } from '../../types/branch'
// Mock the branch service
vi.mock('../../services/branchService', () => ({
  branchService: {
    getAllBranches: vi.fn(),
    enableReservations: vi.fn(),
    disableReservations: vi.fn(),
    updateReservationSettings: vi.fn(),
  }
}))

// Mock data
const mockBranches: Branch[] = [
  {
    id: '1',
    name: 'Downtown Branch',
    name_localized: null,
    reference: 'DT001',
    type: 1,
    latitude: null,
    longitude: null,
    phone: null,
    opening_from: '09:00',
    opening_to: '22:00',
    inventory_end_of_day_time: '23:59',
    receipt_header: null,
    receipt_footer: null,
    settings: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
    receives_online_orders: true,
    accepts_reservations: true,
    reservation_duration: 60,
    reservation_times: {},
    address: null,
    sections: [
      {
        id: 's1',
        branch_id: '1',
        name: 'Main Floor',
        name_localized: null,
        meta: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        floor_id: null,
        revenue_center_id: null,
        tables: [
          { 
            id: 't1', 
            section_id: 's1',
            name: 'Table 1', 
            status: 1,
            seats: 4,
            parent_id: null,
            revenue_center_id: null,
            meta: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            deleted_at: null,
            accepts_reservations: true 
          },
          { 
            id: 't2', 
            section_id: 's1',
            name: 'Table 2', 
            status: 1,
            seats: 4,
            parent_id: null,
            revenue_center_id: null,
            meta: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            deleted_at: null,
            accepts_reservations: true 
          },
          { 
            id: 't3', 
            section_id: 's1',
            name: 'Table 3', 
            status: 1,
            seats: 4,
            parent_id: null,
            revenue_center_id: null,
            meta: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            deleted_at: null,
            accepts_reservations: false 
          },
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Mall Branch',
    name_localized: null,
    reference: 'ML002',
    type: 1,
    latitude: null,
    longitude: null,
    phone: null,
    opening_from: '09:00',
    opening_to: '22:00',
    inventory_end_of_day_time: '23:59',
    receipt_header: null,
    receipt_footer: null,
    settings: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
    receives_online_orders: true,
    accepts_reservations: false,
    reservation_duration: 45,
    reservation_times: {},
    address: null,
    sections: [
      {
        id: 's2',
        branch_id: '2',
        name: 'Food Court',
        name_localized: null,
        meta: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        floor_id: null,
        revenue_center_id: null,
        tables: [
          { 
            id: 't4', 
            section_id: 's2',
            name: 'Table 4', 
            status: 1,
            seats: 4,
            parent_id: null,
            revenue_center_id: null,
            meta: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            deleted_at: null,
            accepts_reservations: true 
          },
          { 
            id: 't5', 
            section_id: 's2',
            name: 'Table 5', 
            status: 1,
            seats: 4,
            parent_id: null,
            revenue_center_id: null,
            meta: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            deleted_at: null,
            accepts_reservations: false 
          },
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Airport Branch',
    name_localized: null,
    reference: 'AP003',
    type: 1,
    latitude: null,
    longitude: null,
    phone: null,
    opening_from: '09:00',
    opening_to: '22:00',
    inventory_end_of_day_time: '23:59',
    receipt_header: null,
    receipt_footer: null,
    settings: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
    receives_online_orders: true,
    accepts_reservations: true,
    reservation_duration: 90,
    reservation_times: {},
    address: null,
    sections: [
      {
        id: 's3',
        branch_id: '3',
        name: 'Terminal A',
        name_localized: null,
        meta: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        floor_id: null,
        revenue_center_id: null,
        tables: [
          { 
            id: 't6', 
            section_id: 's3',
            name: 'Table 6', 
            status: 1,
            seats: 4,
            parent_id: null,
            revenue_center_id: null,
            meta: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            deleted_at: null,
            accepts_reservations: true 
          },
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Deleted Branch',
    name_localized: null,
    reference: 'DEL004',
    type: 1,
    latitude: null,
    longitude: null,
    phone: null,
    opening_from: '09:00',
    opening_to: '22:00',
    inventory_end_of_day_time: '23:59',
    receipt_header: null,
    receipt_footer: null,
    settings: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    deleted_at: '2024-01-01T00:00:00Z',
    receives_online_orders: true,
    accepts_reservations: true,
    reservation_duration: 60,
    reservation_times: {},
    address: null,
    sections: []
  }
]

describe('useBranches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the shared state using the test utility
    const composable = useBranches()
    if ('_resetState' in composable) {
      ;(composable as any)._resetState()
    }
  })

  describe('Data Fetching', () => {
    it('should fetch branches successfully', async () => {
      const mockGetAllBranches = branchService.getAllBranches as Mock
      mockGetAllBranches.mockResolvedValue(mockBranches)

      const { branches, loading, error, fetchAllBranches } = useBranches()

      expect(loading.value).toBe(false)
      expect(branches.value).toEqual([])

      const fetchPromise = fetchAllBranches()
      expect(loading.value).toBe(true)

      await fetchPromise
      await nextTick()

      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(branches.value).toEqual(mockBranches)
      expect(mockGetAllBranches).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch errors', async () => {
      const mockGetAllBranches = branchService.getAllBranches as Mock
      const errorMessage = 'Network error'
      mockGetAllBranches.mockRejectedValue(new Error(errorMessage))

      const { branches, loading, error, fetchAllBranches } = useBranches()

      await fetchAllBranches()
      await nextTick()

      expect(loading.value).toBe(false)
      expect(error.value).toBe(errorMessage)
      expect(branches.value).toEqual([])
    })

    it('should not fetch again if data is already loaded', async () => {
      const mockGetAllBranches = branchService.getAllBranches as Mock
      mockGetAllBranches.mockResolvedValue(mockBranches)

      const { fetchAllBranches } = useBranches()

      await fetchAllBranches()
      await fetchAllBranches() // Second call

      expect(mockGetAllBranches).toHaveBeenCalledTimes(1)
    })
  })

  describe('Computed Properties', () => {
    beforeEach(async () => {
      const mockGetAllBranches = branchService.getAllBranches as Mock
      mockGetAllBranches.mockResolvedValue(mockBranches)
      const { fetchAllBranches } = useBranches()
      await fetchAllBranches()
    })

    it('should filter reservation enabled branches correctly', () => {
      const { reservationEnabledBranches } = useBranches()

      expect(reservationEnabledBranches.value).toHaveLength(2)
      expect(reservationEnabledBranches.value[0].id).toBe('1')
      expect(reservationEnabledBranches.value[1].id).toBe('3')
      
      // Check if it includes computed properties
      expect(reservationEnabledBranches.value[0]).toHaveProperty('reservation_tables_count')
      expect(reservationEnabledBranches.value[0].reservation_tables_count).toBe(2) // 2 tables accept reservations
    })

    it('should filter reservation disabled branches correctly', () => {
      const { reservationDisabledBranches } = useBranches()

      expect(reservationDisabledBranches.value).toHaveLength(1)
      expect(reservationDisabledBranches.value[0].id).toBe('2')
      expect(reservationDisabledBranches.value[0].accepts_reservations).toBe(false)
    })

    it('should filter active branches (exclude deleted)', () => {
      const { activeBranches } = useBranches()

      expect(activeBranches.value).toHaveLength(3)
      expect(activeBranches.value.every(branch => !branch.deleted_at)).toBe(true)
    })

    it('should calculate total reservation tables correctly', () => {
      const { totalReservationTables } = useBranches()

      // Branch 1: 2 tables, Branch 3: 1 table = 3 total
      expect(totalReservationTables.value).toBe(3)
    })

    it('should calculate average duration correctly', () => {
      const { averageDuration } = useBranches()

      // Branch 1: 60 min, Branch 3: 90 min = average 75 min
      expect(averageDuration.value).toBe(75)
    })
  })

  describe('Helper Functions', () => {
    it('should count reservation tables correctly', async () => {
      const mockGetAllBranches = branchService.getAllBranches as Mock
      mockGetAllBranches.mockResolvedValue(mockBranches)
      
      const { fetchAllBranches, reservationEnabledBranches } = useBranches()
      await fetchAllBranches()

      const branch1 = reservationEnabledBranches.value.find(b => b.id === '1')
      expect(branch1?.reservation_tables_count).toBe(2)

      const branch3 = reservationEnabledBranches.value.find(b => b.id === '3')
      expect(branch3?.reservation_tables_count).toBe(1)
    })

    it('should handle branches with no sections', async () => {
      const branchWithNoSections: Branch = {
        ...mockBranches[0],
        id: '5',
        name: 'Empty Branch',
        reference: 'EB005',
        sections: []
      }

      const mockGetAllBranches = branchService.getAllBranches as Mock
      mockGetAllBranches.mockResolvedValue([branchWithNoSections])

      const { reservationEnabledBranches, fetchAllBranches } = useBranches()
      await fetchAllBranches()
      
      // Should handle empty sections gracefully
      expect(() => reservationEnabledBranches.value).not.toThrow()
      expect(reservationEnabledBranches.value[0]?.reservation_tables_count).toBe(0)
    })

    it('should handle branches with undefined sections', async () => {
      const branchWithUndefinedSections: Branch = {
        ...mockBranches[0],
        id: '6',
        name: 'Undefined Sections Branch',
        reference: 'USB006',
        sections: undefined as any
      }

      const mockGetAllBranches = branchService.getAllBranches as Mock
      mockGetAllBranches.mockResolvedValue([branchWithUndefinedSections])

      const { reservationEnabledBranches, fetchAllBranches } = useBranches()

      await fetchAllBranches()
      expect(() => reservationEnabledBranches.value).not.toThrow()
      expect(reservationEnabledBranches.value[0]?.reservation_tables_count).toBe(0)
    })
  })

  describe('Branch Operations', () => {
    beforeEach(async () => {
      // Clear all mocks first
      vi.clearAllMocks()
      
      // Reset shared state using the test utility
      const composable = useBranches()
      if ('_resetState' in composable) {
        ;(composable as any)._resetState()
      }
      
      // Use a fresh deep copy of mock data to avoid mutations
      const mockGetAllBranches = branchService.getAllBranches as Mock
      mockGetAllBranches.mockResolvedValue(JSON.parse(JSON.stringify(mockBranches)))
      const { fetchAllBranches } = useBranches()
      await fetchAllBranches()
    })

    describe('enableReservationsBulk', () => {
      it('should enable reservations for multiple branches successfully', async () => {
        const mockEnableReservations = branchService.enableReservations as Mock
        const updatedBranch = { ...mockBranches[1], accepts_reservations: true }
        mockEnableReservations.mockResolvedValue(updatedBranch)

        const mockRefresh = branchService.getAllBranches as Mock
        mockRefresh.mockResolvedValue([...mockBranches])

        const { enableReservationsBulk, operationLoading } = useBranches()

        expect(operationLoading.value).toBe(false)

        const result = await enableReservationsBulk(['2'])

        expect(operationLoading.value).toBe(false)
        expect(result.succeededIds).toEqual(['2'])
        expect(result.failed).toEqual([])
        expect(mockEnableReservations).toHaveBeenCalledWith('2')
      })

      it('should handle partial failures in bulk operations', async () => {
        const mockEnableReservations = branchService.enableReservations as Mock
        mockEnableReservations
          .mockResolvedValueOnce({ ...mockBranches[1], accepts_reservations: true })
          .mockRejectedValueOnce(new Error('Failed to enable'))

        const { enableReservationsBulk } = useBranches()

        const result = await enableReservationsBulk(['2', '3'])

        expect(result.succeededIds).toEqual(['2'])
        expect(result.failed).toHaveLength(1)
        expect(result.failed[0].id).toBe('3')
        expect(result.failed[0].reason).toBe('Failed to enable')
      })
    })

    describe('disableReservations', () => {
      it('should disable reservations for a single branch', async () => {
        const mockDisableReservations = branchService.disableReservations as Mock
        const updatedBranch = { ...mockBranches[0], accepts_reservations: false }
        mockDisableReservations.mockResolvedValue(updatedBranch)

        const mockRefresh = branchService.getAllBranches as Mock
        mockRefresh.mockResolvedValue([updatedBranch, ...mockBranches.slice(1)])

        const { disableReservations, branches } = useBranches()

        const result = await disableReservations('1')

        expect(result.accepts_reservations).toBe(false)
        expect(mockDisableReservations).toHaveBeenCalledWith('1')
        expect(branches.value[0].accepts_reservations).toBe(false)
      })
    })

    describe('disableAllReservations', () => {
      it('should disable all enabled branches', async () => {
        const mockDisableReservations = branchService.disableReservations as Mock
        mockDisableReservations.mockResolvedValue({ ...mockBranches[0], accepts_reservations: false })

        const mockRefresh = branchService.getAllBranches as Mock
        mockRefresh.mockResolvedValue(mockBranches.map(b => ({ ...b, accepts_reservations: false })))

        const { disableAllReservations, reservationEnabledBranches } = useBranches()

        // Verify the enabled branches before calling disableAll
        const enabledBranches = reservationEnabledBranches.value
        expect(enabledBranches).toHaveLength(2)
        expect(enabledBranches.map(b => b.id).sort()).toEqual(['1', '3'])

        await disableAllReservations()

        // Should call disable for each enabled branch
        expect(mockDisableReservations).toHaveBeenCalledTimes(2)
        const calls = mockDisableReservations.mock.calls.map(call => call[0])
        expect(calls.sort()).toEqual(['1', '3'])
      })
    })

    describe('updateReservationSettings', () => {
      it('should update reservation settings successfully', async () => {
        const mockUpdateSettings = branchService.updateReservationSettings as Mock
        const updatedBranch = { ...mockBranches[0], reservation_duration: 120 }
        mockUpdateSettings.mockResolvedValue(updatedBranch)

        const mockRefresh = branchService.getAllBranches as Mock
        mockRefresh.mockResolvedValue([updatedBranch, ...mockBranches.slice(1)])

        const { updateReservationSettings, operationLoading } = useBranches()

        expect(operationLoading.value).toBe(false)

        const result = await updateReservationSettings('1', { reservation_duration: 120 })

        expect(operationLoading.value).toBe(false)
        expect(result.success).toBe(true)
        expect(result.data?.reservation_duration).toBe(120)
        expect(mockUpdateSettings).toHaveBeenCalledWith('1', { reservation_duration: 120 })
      })

      it('should handle update settings error', async () => {
        const mockUpdateSettings = branchService.updateReservationSettings as Mock
        mockUpdateSettings.mockRejectedValue(new Error('Update failed'))

        const { updateReservationSettings, error } = useBranches()

        const result = await updateReservationSettings('1', { reservation_duration: 120 })

        expect(result.success).toBe(false)
        expect(result.error).toBeInstanceOf(Error)
        expect(error.value).toBe('Update failed')
      })
    })
  })

  describe('Loading States', () => {
    it('should manage loading state correctly during fetch', async () => {
      const mockGetAllBranches = branchService.getAllBranches as Mock
      mockGetAllBranches.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockBranches), 100))
      )

      const { loading, fetchAllBranches } = useBranches()

      expect(loading.value).toBe(false)

      const fetchPromise = fetchAllBranches()
      expect(loading.value).toBe(true)

      await fetchPromise
      expect(loading.value).toBe(false)
    })

    it('should manage operation loading state correctly', async () => {
      const mockEnableReservations = branchService.enableReservations as Mock
      mockEnableReservations.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockBranches[0]), 100))
      )

      const { operationLoading, enableReservationsBulk } = useBranches()

      expect(operationLoading.value).toBe(false)

      const operationPromise = enableReservationsBulk(['1'])
      expect(operationLoading.value).toBe(true)

      await operationPromise
      expect(operationLoading.value).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty branches array', async () => {
      const mockGetAllBranches = branchService.getAllBranches as Mock
      mockGetAllBranches.mockResolvedValue([])

      const { 
        fetchAllBranches, 
        reservationEnabledBranches, 
        totalReservationTables, 
        averageDuration 
      } = useBranches()

      await fetchAllBranches()

      expect(reservationEnabledBranches.value).toEqual([])
      expect(totalReservationTables.value).toBe(0)
      expect(averageDuration.value).toBe(0)
    })

    it('should handle non-array response from API', async () => {
      const mockGetAllBranches = branchService.getAllBranches as Mock
      mockGetAllBranches.mockResolvedValue(null)

      const { fetchAllBranches, branches } = useBranches()

      await fetchAllBranches()

      expect(branches.value).toEqual([])
    })
  })
})