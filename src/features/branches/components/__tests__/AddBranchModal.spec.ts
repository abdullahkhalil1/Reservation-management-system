import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import AddBranchModal from '../../components/AddBranchModal.vue'
import { useBranches } from '../../composables/useBranches'
import { useToast } from '@/shared/composables'
import type { Branch } from '../../types/branch'

// Mock the composables
vi.mock('../../composables/useBranches')
vi.mock('@/shared/composables/useToast')

// Mock Heroicons
vi.mock('@heroicons/vue/24/outline', () => ({
  BuildingStorefrontIcon: { template: '<div data-testid="building-icon"></div>' },
  XMarkIcon: { template: '<div data-testid="x-icon"></div>' }
}))

const mockUseBranches = useBranches as Mock
const mockUseToast = useToast as Mock

describe('AddBranchModal', () => {
  const mockBranches: Branch[] = [
    {
      id: '1',
      name: 'Available Branch 1',
      name_localized: null,
      reference: 'AB001',
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
      reservation_duration: 90,
      address: null,
      sections: [],
      reservation_times: null
    }
  ]

  const mockBranchesComposable = {
    reservationDisabledBranches: { value: mockBranches },
    enableReservationsBulk: vi.fn(),
    fetchAllBranches: vi.fn()
  }

  const mockToastComposable = {
    success: vi.fn(),
    error: vi.fn()
  }

  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseBranches.mockReturnValue(mockBranchesComposable)
    mockUseToast.mockReturnValue(mockToastComposable)
    
    // Reset mock functions
    mockBranchesComposable.enableReservationsBulk.mockReset()
    mockBranchesComposable.fetchAllBranches.mockReset()
    mockToastComposable.success.mockReset()
    mockToastComposable.error.mockReset()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}) => {
    return mount(AddBranchModal, {
      props: {
        isOpen: false,
        ...props
      },
      global: {
        stubs: {
          Modal: {
            template: `
              <div v-if="isOpen" data-testid="modal">
                <div data-testid="modal-title">{{ title }}</div>
                <div data-testid="modal-content"><slot /></div>
                <div data-testid="modal-footer"><slot name="footer" /></div>
              </div>
            `,
            props: ['isOpen', 'title', 'size']
          },
          Button: {
            template: `
              <button 
                data-testid="button" 
                :disabled="disabled || loading"
                @click="$emit('click')"
              >
                <slot />
              </button>
            `,
            props: ['variant', 'loading', 'disabled'],
            emits: ['click']
          },
          Dropdown: {
            template: `
              <div data-testid="dropdown">
                <label>{{ label }}</label>
                <select 
                  :value="modelValue" 
                  @change="handleChange"
                  :multiple="multiple"
                  data-testid="dropdown-select"
                >
                  <option v-for="option in options" :key="option.id" :value="option">
                    {{ option.name }}
                  </option>
                </select>
              </div>
            `,
            props: ['modelValue', 'options', 'label', 'placeholder', 'displayKey', 'valueKey', 'multiple', 'searchable', 'searchPlaceholder'],
            emits: ['update:modelValue'],
            methods: {
              handleChange(event: Event) {
                const target = event.target as HTMLSelectElement
                if (this.multiple) {
                  const selectedOptions = Array.from(target.selectedOptions).map(option => 
                    this.options.find((opt: any) => opt.id === option.value)
                  ).filter(Boolean)
                  this.$emit('update:modelValue', selectedOptions)
                } else {
                  const selectedOption = this.options.find((opt: any) => opt.id === target.value)
                  this.$emit('update:modelValue', selectedOption)
                }
              }
            }
          }
        }
      }
    })
  }

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      wrapper = createWrapper({ isOpen: true })
      
      expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="modal-title"]').text()).toBe('Enable Reservations')
    })

    it('should not render modal when isOpen is false', () => {
      wrapper = createWrapper({ isOpen: false })
      
      expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false)
    })

    it('should render dropdown component', () => {
      wrapper = createWrapper({ isOpen: true })
      
      const dropdown = wrapper.find('[data-testid="dropdown"]')
      expect(dropdown.exists()).toBe(true)
    })

    it('should render action buttons', () => {
      wrapper = createWrapper({ isOpen: true })
      
      const buttons = wrapper.findAll('[data-testid="button"]')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('modal interactions', () => {
    it('should emit close event when cancel button is clicked', async () => {
      wrapper = createWrapper({ isOpen: true })
      const cancelButton = wrapper.findAll('[data-testid="button"]')[0]
      await cancelButton.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('form submission', () => {
    beforeEach(() => {
      wrapper = createWrapper({ isOpen: true })
    })

    it('should call enableReservationsBulk when form is submitted with selected branches', async () => {
      // Mock successful response
      mockBranchesComposable.enableReservationsBulk.mockResolvedValue({
        succeededIds: ['1'],
        failed: []
      })

      // Select a branch by directly setting the component's internal state
      const vm = wrapper.vm as any
      vm.selectedBranches = [mockBranches[0]]
      await nextTick()

      // Find and click the enable button
      const buttons = wrapper.findAll('[data-testid="button"]')
      const enableButton = buttons.find(btn => btn.text().includes('Enable'))
      
      if (enableButton) {
        await enableButton.trigger('click')
        await nextTick()

        expect(mockBranchesComposable.enableReservationsBulk).toHaveBeenCalledWith(['1'])
      }
    })

    it('should show success toast on successful submission', async () => {
      // Mock successful response
      mockBranchesComposable.enableReservationsBulk.mockResolvedValue({
        succeededIds: ['1'],
        failed: []
      })

      // Set selected branches directly
      const vm = wrapper.vm as any
      vm.selectedBranches = [mockBranches[0]]
      await nextTick()

      // Trigger submit by calling the method directly
      await vm.handleSubmit()

      expect(mockToastComposable.success).toHaveBeenCalledWith(
        'Successfully enabled 1 branch',
        'Reservations enabled for: Available Branch 1'
      )
    })

    it('should emit branchAdded event on successful submission', async () => {
      // Mock successful response
      mockBranchesComposable.enableReservationsBulk.mockResolvedValue({
        succeededIds: ['1'],
        failed: []
      })

      // Set selected branches directly
      const vm = wrapper.vm as any
      vm.selectedBranches = [mockBranches[0]]
      await nextTick()

      // Trigger submit by calling the method directly
      await vm.handleSubmit()

      expect(wrapper.emitted('branchAdded')).toBeTruthy()
    })

    it('should show error toast on failed submission', async () => {
      // Mock failed response
      mockBranchesComposable.enableReservationsBulk.mockResolvedValue({
        succeededIds: [],
        failed: [{ id: '1', reason: 'Network error' }]
      })

      // Set selected branches directly
      const vm = wrapper.vm as any
      vm.selectedBranches = [mockBranches[0]]
      await nextTick()

      // Trigger submit by calling the method directly
      await vm.handleSubmit()

      expect(mockToastComposable.error).toHaveBeenCalledWith(
        'Failed to enable 1 branch',
        'Could not enable reservations for: Available Branch 1'
      )
    })

    it('should handle complete failure with exception', async () => {
      // Mock exception
      mockBranchesComposable.enableReservationsBulk.mockRejectedValue(new Error('Network error'))

      // Set selected branches directly
      const vm = wrapper.vm as any
      vm.selectedBranches = [mockBranches[0]]
      await nextTick()

      // Trigger submit by calling the method directly
      await vm.handleSubmit()

      expect(mockToastComposable.error).toHaveBeenCalledWith(
        'Failed to enable reservations',
        'An unexpected error occurred. Please try again.'
      )
    })

    it('should not submit when no branches are selected', async () => {
      // Ensure no branches are selected
      const vm = wrapper.vm as any
      vm.selectedBranches = null
      await nextTick()

      // Trigger submit by calling the method directly
      await vm.handleSubmit()

      // Should not call the API
      expect(mockBranchesComposable.enableReservationsBulk).not.toHaveBeenCalled()
    })
  })

  describe('composable integration', () => {
    it('should use branches composable', () => {
      wrapper = createWrapper({ isOpen: true })
      
      expect(mockUseBranches).toHaveBeenCalled()
    })

    it('should use toast composable', () => {
      wrapper = createWrapper({ isOpen: true })
      
      expect(mockUseToast).toHaveBeenCalled()
    })
  })
})