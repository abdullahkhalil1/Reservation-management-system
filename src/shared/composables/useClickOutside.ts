import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Composable for handling click outside events
 * @param callback - Function to call when clicking outside the element
 * @param options - Configuration options
 * @returns Object with elementRef and isActive state
 */
export function useClickOutside(
  callback: (event: Event) => void,
  options: {
    capture?: boolean
  } = {}
) {
  const elementRef = ref<HTMLElement>()
  const isActive = ref(true)

  const { capture = true } = options

  function handleClickOutside(event: Event) {
    if (!isActive.value) return
    
    if (
      elementRef.value &&
      event.target &&
      !elementRef.value.contains(event.target as Node)
    ) {
      callback(event)
    }
  }

  function activate() {
    isActive.value = true
  }

  function deactivate() {
    isActive.value = false
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside, capture)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside, capture)
  })

  return {
    elementRef,
    isActive,
    activate,
    deactivate,
  }
}
