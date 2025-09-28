import type { TimeSlot, Branch } from '@/shared/types'

/**
 * Format time from "HH:MM:SS" to "HH:MM" format
 */
export function formatTime(time: string): string {
  if (!time) return ''
  // Convert from "HH:MM:SS" to "HH:MM" format
  return time.substring(0, 5)
}

/**
 * Check if two time slots are exactly equal
 */
export function areTimeSlotsEqual(slot1: TimeSlot, slot2: TimeSlot): boolean {
  return slot1.start === slot2.start && slot1.end === slot2.end
}

/**
 * Find indices of duplicate time slots in an array
 */
export function findDuplicateSlots(slots: TimeSlot[]): number[] {
  const duplicateIndices: number[] = []
  
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (areTimeSlotsEqual(slots[i], slots[j])) {
        if (!duplicateIndices.includes(i)) duplicateIndices.push(i)
        if (!duplicateIndices.includes(j)) duplicateIndices.push(j)
      }
    }
  }
  
  return duplicateIndices
}

/**
 * Check if branch is open 24 hours (00:00 to 00:00)
 */
export function isOpen24Hours(branch: Branch | null): boolean {
  if (!branch) return false
  
  const openingFrom = formatTime(branch.opening_from)
  const openingTo = formatTime(branch.opening_to)
  
  return openingFrom === '00:00' && openingTo === '00:00'
}

/**
 * Check if a time is within the branch's opening hours
 */
export function isTimeInRange(time: string, branch: Branch | null): boolean {
  if (!branch) return true
  
  // If open 24 hours (00:00 to 00:00), no validation needed
  if (isOpen24Hours(branch)) return true
  
  const openingFrom = formatTime(branch.opening_from)
  const openingTo = formatTime(branch.opening_to)
  
  return time >= openingFrom && time <= openingTo
}

/**
 * Validation options for time slot validation
 */
export interface TimeSlotValidationOptions {
  start: string
  end: string
  branch: Branch | null
  currentReservationDuration?: number
}

/**
 * Validate a time slot against branch opening hours and reservation duration
 */
export function validateTimeSlot(options: TimeSlotValidationOptions): string | null {
  const { start, end, branch, currentReservationDuration } = options
  
  if (!branch) return null
  
  // Basic validation: start time must be before end time
  if (start >= end) {
    return 'Start time must be before end time'
  }
  
  // Calculate time slot duration in minutes
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  const slotDurationMinutes = endMinutes - startMinutes
  
  // Check if time slot is longer than reservation duration
  // Use current input value if provided, otherwise fall back to branch value or default
  const reservationDurationMinutes = currentReservationDuration ?? branch.reservation_duration ?? 90
  if (slotDurationMinutes < reservationDurationMinutes) {
    return `Time slot must be longer than reservation duration (${reservationDurationMinutes} minutes)`
  }
  
  // If open 24 hours (00:00 to 00:00), skip opening hours validation
  if (isOpen24Hours(branch)) {
    return null
  }
  
  const openingFrom = formatTime(branch.opening_from)
  const openingTo = formatTime(branch.opening_to)
  
  if (start < openingFrom || start > openingTo) {
    return `Start time must be between ${openingFrom} and ${openingTo}`
  }
  
  if (end < openingFrom || end > openingTo) {
    return `End time must be between ${openingFrom} and ${openingTo}`
  }
  
  return null
}

/**
 * Check if two time slots overlap
 */
export function doSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // Convert times to minutes for easier comparison
  const start1Minutes = timeToMinutes(slot1.start)
  const end1Minutes = timeToMinutes(slot1.end)
  const start2Minutes = timeToMinutes(slot2.start)
  const end2Minutes = timeToMinutes(slot2.end)
  
  // Slots overlap if one starts before the other ends
  return start1Minutes < end2Minutes && end1Minutes > start2Minutes
}

/**
 * Find indices of overlapping time slots in an array
 */
export function findOverlappingSlots(slots: TimeSlot[]): number[] {
  const overlappingIndices: number[] = []
  
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (doSlotsOverlap(slots[i], slots[j])) {
        if (!overlappingIndices.includes(i)) overlappingIndices.push(i)
        if (!overlappingIndices.includes(j)) overlappingIndices.push(j)
      }
    }
  }
  
  return overlappingIndices
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Calculate the duration of a time slot in minutes
 */
export function getTimeSlotDuration(start: string, end: string): number {
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  return endMinutes - startMinutes
}

/**
 * Format minutes to hours and minutes string (e.g., "90 minutes" or "2 hours 30 minutes")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`
  }
  
  return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minutes`
}
