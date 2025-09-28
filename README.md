# Restaurant Reservation Manager

A modern Vue 3 application for managing restaurant branch reservations with TypeScript, built using the Composition API and feature-based architecture.

## 🏗️ Project Structure

```
restaurant-reservation-manager/
├── src/
│   ├── assets/                       # Static assets (CSS, images, etc.)
│   ├── config/                       # App-wide configuration
│   │   └── api.ts                    # API configuration
│   │
│   ├── shared/                       # Shared resources across features
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Button.vue            # Button component
│   │   │   ├── Modal.vue             # Modal component
│   │   │   ├── Input.vue             # Input component
│   │   │   ├── Dropdown.vue          # Dropdown component
│   │   │   ├── Table.vue             # Table component
│   │   │   ├── Tooltip.vue           # Tooltip component
│   │   │   ├── ToastNotification.vue # Toast notification component
│   │   │   ├── ConfirmationModal.vue # Confirmation modal component
│   │   │   └── index.ts              # Component exports
│   │   ├── composables/              # Shared Vue composables
│   │   │   ├── useClickOutside.ts    # Click outside detection
│   │   │   ├── useToast.ts           # Toast notifications
│   │   │   └── index.ts              # Composable exports
│   │   ├── services/                 # Shared services
│   │   │   ├── api.ts                # API client with interceptors
│   │   │   └── index.ts              # Service exports
│   │   ├── types/                    # Shared TypeScript types
│   │   │   ├── api.ts                # API-related types
│   │   │   └── index.ts              # Type exports
│   │   └── utils/                    # Utility functions
│   │       └── timeUtils.ts          # Time-related utilities
│   │
│   ├── features/                     # Feature-based modules
│   │   └── branches/                 # Branch management feature
│   │       ├── components/           # Feature-specific components
│   │       │   ├── __tests__/        # Component tests
│   │       │   ├── AddBranchModal.vue # Add branch modal
│   │       │   ├── BranchList.vue    # Branch list component
│   │       │   └── EditBranchModal.vue # Edit branch modal
│   │       ├── composables/          # Feature-specific composables
│   │       │   ├── __tests__/        # Composable tests
│   │       │   │   ├── useBranches.spec.ts # Test file
│   │       │   │   └── testUtils.ts  # Test utilities
│   │       │   └── useBranches.ts    # Branch state management
│   │       ├── services/             # Feature-specific services
│   │       │   └── branchService.ts  # Branch API service
│   │       ├── types/                # Feature-specific types
│   │       │   └── branch.ts         # Branch-related types
│   │       └── views/                # Feature views/pages
│   │           └── ReservationManagement.vue # Main reservation page
│   │
│   ├── router/                       # Vue Router configuration
│   │   └── index.ts                  # Router setup
│   ├── App.vue                       # Root component
│   └── main.ts                       # Application entry point
│
├── public/                           # Static public assets
│   └── favicon.ico                   # App favicon
├── dist/                             # Production build output
├── node_modules/                     # Dependencies
├── .vscode/                          # VS Code configuration
├── package.json                      # Project dependencies and scripts
├── vite.config.ts                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── vitest.config.ts                  # Vitest test configuration
├── eslint.config.ts                  # ESLint configuration
└── README.md                         # Project documentation
```

## 🎯 Key Implementation Decisions

### 1. Feature-Based Architecture

**Rationale**: Organizes code by business features rather than technical layers, improving maintainability and scalability.

**Benefits**:
- **Scalability**: Easy to add new features without affecting existing ones
- **Team Collaboration**: Different teams can work on different features independently
- **Code Organization**: Related functionality is grouped together
- **Maintainability**: Easier to locate and modify feature-specific code

### 2. State Management with Composables (and Migration Path to Pinia)

**Rationale**: 
We use Vue 3's Composition API with composables to encapsulate state and business logic outside of components. This ensures components remain focused on presentation, while composables manage data fetching, transformations, and side effects.

For now, this keeps the project lightweight and simple (no external dependencies), while still offering a clear separation of concerns. As the application grows, composables can naturally evolve into a Pinia store for better scalability, dev tooling, and ecosystem support.

**Benefits**:
- **Separation of Concerns**: UI = components, Logic = composables
- **Reusability**: Business logic is easily shared across multiple components
- **Testability**: Composables can be unit tested without a UI layer
- **Flexibility**: Composables work seamlessly with Composition API
- **Scalability Path**: Pinia can replace/augment composables if the state grows complex

**Migration Path to Pinia**:
For larger projects, consider migrating to **Pinia** when you encounter:
- **Multiple Features**: 5+ feature modules with complex interactions
- **Complex State Logic**: Advanced patterns like time-travel debugging needed

```typescript
// Current: Composable approach
export function useBranches() {
  const branches = ref<Branch[]>([])
  return { branches, fetchAllBranches }
}

// Future: Pinia store (when scaling up)
export const useBranchStore = defineStore('branches', () => {
  const branches = ref<Branch[]>([])
  const fetchAllBranches = async () => { /* ... */ }
  return { branches, fetchAllBranches }
})
```
**Implementation Example**:
```typescript
// useBranches.ts - Business logic separated from components
export function useBranches() {
  // Shared state
  const branches = ref<Branch[]>([])
  const loading = ref(false)
  
  // Business logic methods
  const enableReservationsBulk = async (branchIds: string[]) => {
    // Complex business logic for bulk operations
    operationLoading.value = true
    try {
      const results = await Promise.allSettled(
        branchIds.map(id => branchService.enableReservations(id))
      )
      // Handle partial successes/failures
      return processResults(results, branchIds)
    } finally {
      operationLoading.value = false
    }
  }
  
  return {
    // Expose only what components need
    branches: readonly(branches),
    loading: readonly(loading),
    enableReservationsBulk
  }
}
```

**Usage Across Components**:
```typescript
// In AddBranchModal.vue
const { enableReservationsBulk, operationLoading } = useBranches()

// In BranchList.vue  
const { branches, loading, reservationEnabledBranches } = useBranches()

// In ReservationManagement.vue
const { totalReservationTables, averageDuration } = useBranches()
```

### 3. UI Framework Strategy: Tailwind CSS + Headless UI

**Rationale**: Combines the flexibility of custom components with the convenience of pre-built accessible components.

**Approach**:
- **Custom Components**: Built from scratch using Tailwind CSS for maximum control and flexibility
- **Headless UI**: Used selectively for complex components requiring advanced accessibility and transitions

**Benefits**:
- **Full Control**: Custom components allow complete control over styling and behavior
- **Consistency**: Tailwind ensures consistent design system across all components using tailwind configuration file
- **Performance**: Only include what you need, smaller bundle size
- **Flexibility**: Easy to customize and extend components as needed

**When to Use Each**:
- **Custom Components**: Simple UI elements (buttons, inputs, cards, tables)
- **Headless UI**: Complex interactions (dropdowns, modals, transitions, focus management)


## 🔮 Assumptions & Future Improvements

### API Optimization Assumptions

**Current Implementation**: The application currently makes sequential API calls for bulk operations due to current API limitations.

**Future API Improvements Assumed**:

1. **Bulk Enable Reservations API**:
   ```typescript
   // Current: Sequential calls
   branchIds.map(id => branchService.enableReservations(id))
   
   // Future: Single bulk API call
   branchService.enableReservationsBulk(branchIds)
   ```

2. **Bulk Disable All Reservations API**:
   ```typescript
   // Current: Sequential disable calls
   enabledBranches.map(branch => disableReservations(branch.id))
   
   // Future: Single bulk disable API
   branchService.disableAllReservations()
   ```

**Benefits of Future API**:
- **Performance**: Reduced network overhead and faster operations
- **Consistency**: Atomic operations ensure data consistency
- **Server Efficiency**: Reduced server load from multiple requests

```

## 🚀 Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abdullahkhalil1/Reservation-management-system
   cd restaurant-reservation-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your API endpoints and other settings
   ```

### Development

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Run tests**:
   ```bash
   # Unit tests
   npm run test:unit

   **Test Coverage Note**: Currently, the project includes comprehensive test suites for the core `useBranches` composable and the `AddBranchModal` component. These tests cover the essential business logic, state management, and component interactions. The testing foundation is established with proper mocking, utilities, and patterns that can be extended to cover additional components as the project evolves.


### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```
