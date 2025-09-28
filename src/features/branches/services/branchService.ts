import { apiClient } from '../../../shared/services/api'
import type { Branch, UpdateBranchReservationRequest, ApiResponse } from '@/shared/types'

export class BranchService {
  private readonly endpoint = '/branches'

  /**
   * Get all branches with sections and tables included
   */
  async getAllBranches(): Promise<Branch[]> {
    const params = {
      'include[0]': 'sections',
      'include[1]': 'sections.tables'
    }
    const response = await apiClient.get<Branch[]>(this.endpoint, { params })
    return response.data
  }


  /**
   * Simply enable reservations for a branch (without additional settings)
   */
  async enableReservations(branchId: string): Promise<Branch> {
    const updateData = {
      accepts_reservations: true,
    }
    
    const response = await apiClient.put<Branch>(`${this.endpoint}/${branchId}`, updateData)
    return response.data
  }

  /**
   * Disable reservations for a branch
   */
  async disableReservations(branchId: string): Promise<Branch> {
    const updateData: UpdateBranchReservationRequest = {
      accepts_reservations: false,
    }
    
    const response = await apiClient.put<Branch>(`${this.endpoint}/${branchId}`, updateData)
    return response.data
  }

  /**
   * Update branch reservation settings
   */
  async updateReservationSettings(branchId: string, settings: UpdateBranchReservationRequest): Promise<Branch> {
    const response = await apiClient.put<Branch>(`${this.endpoint}/${branchId}`, settings)
    return response.data
  }
}

export const branchService = new BranchService()
