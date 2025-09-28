<template>
  <Modal
    :is-open="isOpen"
    title="Edit Reservation Settings"
    size="lg"
    @close="handleClose"
  >
    <form v-if="branch" @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Branch Info -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-medium text-gray-900">{{ branch.name }}</h3>
        <p class="text-sm text-gray-600">{{ branch.reference }}</p>
        <div v-if="branchDetails" class="mt-2 text-sm text-gray-600">
          <span class="font-medium">Opening Hours:</span>
          {{ isOpen24Hours(branchDetails) ? '24 Hours' : `${formatTime(branchDetails.opening_from)} - ${formatTime(branchDetails.opening_to)}` }}
        </div>
      </div>

      <!-- Reservation Duration -->
      <Input
        v-model="reservationDuration"
        type="number"
        label="Reservation Duration (minutes)"
        min="30"
        max="120"
        step="15"
        required
        :error="durationError || undefined"
      />

      <!-- Tables Dropdown -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Tables
        </label>
        <Dropdown
          v-model="selectedTables"
          :options="tableOptions"
          :multiple="true"
          :searchable="true"
          placeholder="Select tables..."
          search-placeholder="Search tables..."
          display-key="label"
          value-key="id"
        />
      </div>

      <!-- Time Slots Configuration -->
      <div class="flex flex-col h-96">
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Available Time Slots
        </label>
        
        <div class="flex-1 overflow-y-auto overflow-x-hidden space-y-4 pr-2">
          <div
            v-for="(day, dayIndex) in timeSlots"
            :key="day.day"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <h4 class="text-sm font-medium text-gray-900 capitalize">
                  {{ day.day }}
                </h4>
                <Button
                  v-if="day.day === 'saturday'"
                  variant="ghost"
                  size="sm"
                  @click="applyToAllDays"
                  :disabled="day.slots.length === 0"
                >
                  Apply on all days
                </Button>
              </div>
              <Tooltip
                :content="day.slots.length >= 3 ? 'Maximum 3 slots per day' : 'Add time slot'"
                position="top"
              >
                <Button
                  variant="icon"
                  size="sm"
                  @click="addTimeSlot(dayIndex)"
                  :disabled="day.slots.length >= 3"
                >
                  <PlusIcon class="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>

            <div class="space-y-2">
              <div
                v-for="(slot, slotIndex) in day.slots"
                :key="slotIndex"
                class="space-y-2"
              >
                <div class="flex items-center space-x-3">
                  <div class="flex flex-col">
                    <input
                      v-model="slot.start"
                      type="time"
                      class="block border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :class="{ 
                        'border-red-300 focus:border-red-500 focus:ring-red-500': !isTimeInRange(slot.start, branchDetails) || findDuplicateSlots(day.slots).includes(slotIndex) || findOverlappingSlots(day.slots).includes(slotIndex) || validateTimeSlot({ start: slot.start, end: slot.end, branch: branchDetails, currentReservationDuration: reservationDuration }) !== null
                      }"
                      required
                    />
                  </div>
                  <span class="text-gray-500">-</span>
                  <div class="flex flex-col">
                    <input
                      v-model="slot.end"
                      type="time"
                      class="block border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      :class="{ 
                        'border-red-300 focus:border-red-500 focus:ring-red-500': !isTimeInRange(slot.end, branchDetails) || findDuplicateSlots(day.slots).includes(slotIndex) || findOverlappingSlots(day.slots).includes(slotIndex) || validateTimeSlot({ start: slot.start, end: slot.end, branch: branchDetails, currentReservationDuration: reservationDuration }) !== null
                      }"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    class="text-danger-600 hover:text-danger-800 p-1 hover:bg-danger-50 rounded transition-colors"
                    @click="removeTimeSlot(dayIndex, slotIndex)"
                    title="Remove time slot"
                  >
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </div>
                <!-- Validation error messages -->
                <div class="ml-1 space-y-1">
                  <div
                    v-if="validateTimeSlot({ start: slot.start, end: slot.end, branch: branchDetails, currentReservationDuration: reservationDuration }) && !findDuplicateSlots(day.slots).includes(slotIndex) && !findOverlappingSlots(day.slots).includes(slotIndex)"
                    class="text-sm text-red-600"
                  >
                    {{ validateTimeSlot({ start: slot.start, end: slot.end, branch: branchDetails, currentReservationDuration: reservationDuration }) }}
                  </div>
                  <div
                    v-if="findDuplicateSlots(day.slots).includes(slotIndex)"
                    class="text-sm text-red-600"
                  >
                    Duplicate time slot - each slot must be unique
                  </div>
                  <div
                    v-if="findOverlappingSlots(day.slots).includes(slotIndex)"
                    class="text-sm text-red-600"
                  >
                    Time slot overlaps with another slot
                  </div>
                </div>
              </div>
              
              <div v-if="day.slots.length === 0" class="text-sm text-gray-500 italic py-2 flex items-center">
                Add Available Reservation Times
                <Tooltip content="Add time slot" position="top">
                  <Button
                    variant="icon"
                    size="sm"
                    @click="addTimeSlot(dayIndex)"
                    class="ml-2"
                  >
                    <PlusIcon class="h-3 w-3" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

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
        :disabled="operationLoading || hasValidationErrors"
        @click="handleSubmit"
      >
        {{ operationLoading ? 'Updating...' : 'Update Settings' }}
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useBranches } from '@/features/branches/composables/useBranches'
import { useToast } from '@/shared/composables'
import { Modal, Button, Dropdown, Tooltip, Input } from '@/shared/components'

import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { formatTime, findDuplicateSlots, isOpen24Hours, isTimeInRange, validateTimeSlot, findOverlappingSlots } from '@/shared/utils/timeUtils'
import type { BranchSummary, DayTimeSlots, TimeSlot, Branch, ReservationTimesAPI } from '@/shared/types'

interface Props {
  isOpen: boolean
  branch: BranchSummary | null
}

interface TableOption {
  id: string
  label: string
  sectionName: string
  tableName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  branchUpdated: []
}>()

const { branches, updateReservationSettings, operationLoading } = useBranches()
const { success, error: showError } = useToast()

// Form state
const reservationDuration = ref(90)
const selectedTables = ref<TableOption[]>([])
const branchDetails = ref<Branch | null>(null)

const daysOfWeek = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const timeSlots = ref<DayTimeSlots[]>(
  daysOfWeek.map(day => ({
    day,
    slots: [] as TimeSlot[]
  }))
)

// Computed properties
const tableOptions = computed<TableOption[]>(() => {
  if (!branchDetails.value?.sections) return []
  
  const options: TableOption[] = []
  branchDetails.value.sections.forEach(section => {
    if (section.tables) {
      section.tables.forEach(table => {
        // Only include tables that accept reservations
        if (table.accepts_reservations) {
          options.push({
            id: table.id,
            label: `${section.name} - ${table.name}`,
            sectionName: section.name,
            tableName: table.name
          })
        }
      })
    }
  })
  
  return options.sort((a, b) => a.label.localeCompare(b.label))
})

const durationError = computed(() => {
  const duration = Number(reservationDuration.value)
  if (isNaN(duration) || duration < 30 || duration > 120) {
    return 'Duration must be between 30 and 120 minutes'
  }
  return null
})

const saturdaySlotErrors = computed(() => {
  const saturdayDay = timeSlots.value.find(day => day.day === 'saturday')
  if (!saturdayDay) return false
  
  // Check for validation errors
  const hasTimeErrors = saturdayDay.slots.some(slot => validateTimeSlot({ start: slot.start, end: slot.end, branch: branchDetails.value, currentReservationDuration: reservationDuration.value }) !== null)
  // Check for duplicates
  const hasDuplicates = findDuplicateSlots(saturdayDay.slots).length > 0
  // Check for overlaps
  const hasOverlaps = findOverlappingSlots(saturdayDay.slots).length > 0
  
  return hasTimeErrors || hasDuplicates || hasOverlaps
})

const hasValidationErrors = computed(() => {
  // Check duration errors
  if (durationError.value) return true
  
  // Check Saturday slot errors (required for "Apply on all days" functionality)
  if (saturdaySlotErrors.value) return true
  
  // Check if any time slots have validation errors, duplicates, or overlaps
  return timeSlots.value.some(day => {
    // Check for validation errors
    const hasTimeErrors = day.slots.some(slot => validateTimeSlot({ start: slot.start, end: slot.end, branch: branchDetails.value, currentReservationDuration: reservationDuration.value }) !== null)
    // Check for duplicates
    const hasDuplicates = findDuplicateSlots(day.slots).length > 0
    // Check for overlaps
    const hasOverlaps = findOverlappingSlots(day.slots).length > 0
    return hasTimeErrors || hasDuplicates || hasOverlaps
  })
})

// Methods

function addTimeSlot(dayIndex: number) {
  if (timeSlots.value[dayIndex].slots.length < 3) {
    const defaultStart = branchDetails.value ? formatTime(branchDetails.value.opening_from) : '18:00'
    const defaultEnd = branchDetails.value ? formatTime(branchDetails.value.opening_to) : '22:00'
    
    timeSlots.value[dayIndex].slots.push({ 
      start: defaultStart, 
      end: defaultEnd 
    })
  }
}

function removeTimeSlot(dayIndex: number, slotIndex: number) {
  timeSlots.value[dayIndex].slots.splice(slotIndex, 1)
}

function applyToAllDays() {
  const saturdayIndex = daysOfWeek.indexOf('saturday')
  if (saturdayIndex === -1) return
  
  const saturdaySlots = timeSlots.value[saturdayIndex].slots
  if (saturdaySlots.length === 0) return
  
  // Copy Saturday's slots to all other days
  timeSlots.value.forEach((day, index) => {
    if (index !== saturdayIndex) {
      day.slots = saturdaySlots.map(slot => ({ ...slot }))
    }
  })
}

function loadBranchDetails() {
  if (!props.branch) return

  // Find the full branch data from the already loaded branches
  const details = branches.value.find(b => b.id === props.branch!.id)
  if (!details) {
    console.error('Branch not found in loaded branches:', props.branch.id)
    return
  }

  branchDetails.value = details
  
  reservationDuration.value = details.reservation_duration || 90
  
  // Load selected tables (tables that accept reservations)
  const reservationTables: TableOption[] = []
  if (details.sections) {
    details.sections.forEach(section => {
      if (section.tables) {
        section.tables.forEach(table => {
          if (table.accepts_reservations) {
            reservationTables.push({
              id: table.id,
              label: `${section.name} - ${table.name}`,
              sectionName: section.name,
              tableName: table.name
            })
          }
        })
      }
    })
  }
  selectedTables.value = reservationTables
  
  // Initialize time slots
  const initialTimeSlots = daysOfWeek.map(day => ({
    day,
    slots: [] as TimeSlot[]
  }))
  
  // Populate existing time slots if available
  if (details.reservation_times && typeof details.reservation_times === 'object') {
    Object.entries(details.reservation_times).forEach(([day, timeSlots]) => {
      const dayIndex = daysOfWeek.indexOf(day)
      if (dayIndex !== -1 && Array.isArray(timeSlots)) {
        initialTimeSlots[dayIndex].slots = timeSlots.map((slot: string[]) => ({
          start: slot[0],
          end: slot[1]
        }))
      }
    })
  } else {
    // Default time slots if none exist - add one slot to Saturday
    const saturdayIndex = daysOfWeek.indexOf('saturday')
    if (saturdayIndex !== -1) {
      initialTimeSlots[saturdayIndex].slots = [{ start: '18:00', end: '22:00' }]
    }
  }
  
  timeSlots.value = initialTimeSlots
}

async function handleSubmit() {
  if (!props.branch) return

  // Convert time slots to API format
  const reservationTimes: ReservationTimesAPI = {}
  
  timeSlots.value.forEach(day => {
    if (day.slots.length > 0) {
      reservationTimes[day.day] = day.slots.map(slot => [slot.start, slot.end])
    }
  })

  const result = await updateReservationSettings(props.branch.id, {
    accepts_reservations: true,
    reservation_duration: reservationDuration.value,
    reservation_times: reservationTimes
  })
  
  if (result.success) {
    success('Settings Updated', 'Branch reservation settings have been updated successfully')
    emit('branchUpdated')
  } else {
    // Handle API validation errors
    const error = result.error
    if (error?.details?.errors) {
      const errors = error.details.errors
      const errorMessages: string[] = []
      
      // Parse validation errors
      Object.entries(errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((message: string) => {
            // Format field names to be more user-friendly
            const friendlyField = field.replace('reservation_times.', '').replace('_', ' ')
            errorMessages.push(`${friendlyField}: ${message}`)
          })
        }
      })
      
      if (errorMessages.length > 0) {
        showError(
          'Validation Error',
          errorMessages.join('\n')
        )
      } else {
        showError('Update Failed', 'Failed to update branch settings. Please check your input and try again.')
      }
    } else {
      showError('Update Failed', 'An unexpected error occurred. Please try again.')
    }
  }
}

function handleClose() {
  emit('close')
}

// Watch for branch changes to load details
watch(() => props.branch, (newBranch) => {
  if (newBranch && props.isOpen) {
    loadBranchDetails()
  }
})

// Watch for modal open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.branch) {
    loadBranchDetails()
  }
})
</script>
