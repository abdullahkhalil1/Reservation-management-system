<template>
  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <div class="max-h-96 overflow-y-auto">
      <table class="min-w-full divide-y divide-gray-300">
        <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
            >
              {{ column.label }}
            </th>
            <th v-if="$slots.actions" scope="col" class="relative px-6 py-3 bg-gray-50">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading" class="animate-pulse">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-4 text-center text-gray-500">
              <div class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            </td>
          </tr>
          <tr v-else-if="data.length === 0">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-4 text-center text-gray-500">
              {{ emptyMessage }}
            </td>
          </tr>
          <tr 
            v-else 
            v-for="(item, index) in data" 
            :key="getItemKey(item, index)" 
            class="hover:bg-gray-50 transition-colors"
            :class="{ 'cursor-pointer': rowClickable }"
            @click="handleRowClick(item, index)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm"
              :class="column.class || 'text-gray-900'"
            >
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="getNestedValue(item, column.key)"
                :index="index"
              >
                {{ getNestedValue(item, column.key) }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <slot name="actions" :item="item" :index="index" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  class?: string
}

interface Props {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  itemKey?: string
  rowClickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'No data available',
  itemKey: 'id',
  rowClickable: false,
})

const emit = defineEmits<{
  'row-click': [item: any, index: number]
}>()

function getItemKey(item: any, index: number): string | number {
  return item[props.itemKey] ?? index
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function handleRowClick(item: any, index: number) {
  if (props.rowClickable) {
    emit('row-click', item, index)
  }
}
</script>
