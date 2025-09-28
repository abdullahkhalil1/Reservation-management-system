<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow flex-shrink-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <BuildingStorefrontIcon class="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Restaurant Manager</h1>
              <p class="text-sm text-gray-600">Foodics Reservation System</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500">
              Last updated: {{ lastUpdated }}
            </div>
            <button
              type="button"
              class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              @click="refreshData"
              :disabled="loading"
            >
              <ArrowPathIcon class="h-4 w-4 mr-2 inline" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <!-- Branch Management -->
      <BranchList />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 flex-shrink-0 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">
            © 2025 Restaurant Reservation Manager. Powered by Foodics API.
          </p>
          <div class="flex space-x-6">
            <a href="#" class="text-sm text-gray-500 hover:text-gray-900">Documentation</a>
            <a href="#" class="text-sm text-gray-500 hover:text-gray-900">Support</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBranches } from '@/features/branches/composables/useBranches'
import BranchList from '../components/BranchList.vue'
import {
  BuildingStorefrontIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'

const { refreshBranches, loading } = useBranches()

// Local state
const lastUpdated = ref<string>('')

// Methods
async function refreshData() {
  try {
    await refreshBranches()
    lastUpdated.value = format(new Date(), 'MMM dd, yyyy HH:mm')
  } catch (error) {
    console.error('Failed to refresh data:', error)
  }
}

</script>
