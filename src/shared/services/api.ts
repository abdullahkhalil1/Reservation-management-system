import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { ApiResponse, ApiError, ApiRequestConfig } from '../types/api'
import { API_CONFIG } from '@/config/api'

class ApiClient {
  private client: AxiosInstance

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = API_CONFIG.TOKEN
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const status = error?.response?.status
        let message = 'An unexpected error occurred'

        if (error?.response) {
          const data = error.response.data
          const serverMessage = data?.message || data?.error || null

          if (status === 400) {
            message = serverMessage || 'Bad request'
          } else if (status === 401) {
            message = 'Unauthorized. Please sign in again.'
          } else if (status === 403) {
            message = 'You do not have permission to perform this action.'
          } else if (status === 404) {
            message = 'Requested resource was not found.'
          } else if (status === 422) {
            // Try to surface first validation error if present
            if (data?.errors && typeof data.errors === 'object') {
              const firstField = Object.keys(data.errors)[0]
              const fieldErrors = data.errors[firstField]
              const firstError = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors
              message = firstError || serverMessage || 'Validation error'
            } else {
              message = serverMessage || 'Validation error'
            }
          } else if (typeof status === 'number' && status >= 500) {
            message = 'Server error. Please try again later.'
          } else {
            message = serverMessage || error.message || message
          }
        } else if (error?.request) {
          // No response received from server
          message = 'Network error. Please check your internet connection.'
        } else {
          // Something happened setting up the request
          message = error?.message || message
        }

        const apiError: ApiError = {
          message,
          code: status ? String(status) : (error?.code || (error?.request ? 'NETWORK_ERROR' : undefined)),
          details: error?.response?.data,
        }
        return Promise.reject(apiError)
      }
    )
  }

  async get<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()
