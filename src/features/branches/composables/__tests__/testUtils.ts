import type { Branch } from '@/types'

/**
 * Test utilities for branch-related tests
 */

/**
 * Creates a mock branch with default values
 */
export function createMockBranch(overrides: Partial<Branch> = {}): Branch {
  return {
    id: '1',
    name: 'Test Branch',
    name_localized: null,
    reference: 'TB001',
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
        name: 'Main Section',
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
        ]
      }
    ],
    ...overrides
  }
}

/**
 * Creates multiple mock branches
 */
export function createMockBranches(count: number, baseOverrides: Partial<Branch> = {}): Branch[] {
  return Array.from({ length: count }, (_, index) => 
    createMockBranch({
      id: `${index + 1}`,
      name: `Branch ${index + 1}`,
      reference: `BR${String(index + 1).padStart(3, '0')}`,
      ...baseOverrides
    })
  )
}

/**
 * Creates a branch with specific reservation table count
 */
export function createBranchWithTableCount(
  id: string, 
  name: string, 
  reservationTableCount: number,
  totalTableCount: number = reservationTableCount
): Branch {
  const tables = Array.from({ length: totalTableCount }, (_, index) => ({
    id: `t${id}-${index + 1}`,
    section_id: `s${id}`,
    name: `Table ${index + 1}`,
    status: 1,
    seats: 4,
    parent_id: null,
    revenue_center_id: null,
    meta: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
    accepts_reservations: index < reservationTableCount
  }))

  return createMockBranch({
    id,
    name,
    reference: `${name.substring(0, 2).toUpperCase()}${id.padStart(3, '0')}`,
    sections: [
      {
        id: `s${id}`,
        branch_id: id,
        name: 'Main Section',
        name_localized: null,
        meta: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
        floor_id: null,
        revenue_center_id: null,
        tables
      }
    ]
  })
}

/**
 * Mock service responses
 */
export const mockServiceResponses = {
  success: <T>(data: T) => Promise.resolve(data),
  error: (message: string) => Promise.reject(new Error(message)),
  delayed: <T>(data: T, ms: number = 100) => 
    new Promise<T>(resolve => setTimeout(() => resolve(data), ms))
}