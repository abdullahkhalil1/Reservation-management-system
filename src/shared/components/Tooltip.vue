<template>
  <div
    class="relative inline-block"
    ref="triggerRef"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <!-- Trigger -->
    <slot />

    <Teleport v-if="isVisible && content" to="body">
      <div
        ref="tooltipRef"
        :style="tooltipStyle"
        role="tooltip"
        class="fixed z-[9999] px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap pointer-events-none shadow-lg transition-opacity duration-150"
        :class="{ 'opacity-100': isVisible, 'opacity-0': !isVisible }"
      >
        {{ content }}

        <!-- Arrow -->
        <div
          v-if="showArrow"
          :class="arrowClass"
          class="absolute w-2 h-2 bg-gray-800 transform rotate-45"
        ></div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, nextTick } from 'vue'

interface Props {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  showArrow?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  showArrow: true,
  disabled: false,
})

const isVisible = ref(false)
const tooltipRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const tooltipStyle = shallowRef<Record<string, string>>({})

const arrowPositions = {
  top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
  left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
  right: 'right-full top-1/2 -translate-y-1/2 -mr-1',
}
const arrowClass = arrowPositions[props.position]

async function showTooltip() {
  if (props.disabled) return
  isVisible.value = true

  await nextTick()

  const trigger = triggerRef.value
  const tooltip = tooltipRef.value
  if (!trigger || !tooltip) return

  const triggerRect = trigger.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  let top = 0
  let left = 0

  switch (props.position) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - 8
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + 8
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.left - tooltipRect.width - 8
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.right + 8
      break
  }

  // Ensure tooltip stays inside viewport
  const padding = 8
  left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))
  top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))

  tooltipStyle.value = { top: `${top}px`, left: `${left}px` }
}

function hideTooltip() {
  isVisible.value = false
}
</script>
