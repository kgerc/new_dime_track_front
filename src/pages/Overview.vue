<template>
  <!-- Use q-page so content is placed below the pinned header from MainLayout -->
  <q-page class="bg-grey-1">
    <!-- Month/Year Filter -->
    <div class="row justify-center items-center q-my-md">
      <q-btn icon="arrow_back" flat @click="prevMonth" />
      <div class="q-mx-md text-h6">
        {{ currentMonthName }} {{ selectedYear }}
      </div>
      <q-btn icon="arrow_forward" flat @click="nextMonth" />
    </div>

    <!-- Three panels side by side for Savings, Expenses, Incomes -->
    <div class="row q-col-gutter-md q-px-md q-pb-md">

      <!-- Savings Panel -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Savings</div>
          </q-card-section>

          <q-separator />

          <q-card-section style="max-height: 300px; overflow-y: auto;">
            <q-list bordered separator>
              <q-item
                v-for="(entry, idx) in filteredSavings"
                :key="idx"
              >
                <q-item-section class="text-weight-bold" :class="amountColor(entry.amount)">
                  <q-item-label>{{ entry.name }}</q-item-label>
                  <q-item-label caption>{{ new Date(entry.date).toLocaleDateString() }}</q-item-label>
                </q-item-section>
                <q-item-section side top class="text-weight-bold" :class="amountColor(entry.amount)">
                  <q-item-label>{{ formatCurrency(entry.amount) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Expenses Panel -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Expenses</div>
          </q-card-section>

          <q-separator />

          <q-card-section style="max-height: 300px; overflow-y: auto;">
            <q-list bordered separator>
              <q-item
                v-for="(entry, idx) in filteredExpenses"
                :key="idx"
              >
                <q-item-section class="text-weight-bold" :class="amountColor(entry.amount)">
                  <q-item-label>{{ entry.name }}</q-item-label>
                  <q-item-label caption>{{ new Date(entry.date).toLocaleDateString() }}</q-item-label>
                </q-item-section>
                <q-item-section side top class="text-weight-bold" :class="amountColor(entry.amount)">
                  <q-item-label>{{ formatCurrency(entry.amount) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Incomes Panel -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Incomes</div>
          </q-card-section>

          <q-separator />

          <q-card-section style="max-height: 300px; overflow-y: auto;">
            <q-list bordered separator>
              <q-item
                v-for="(entry, idx) in filteredIncomes"
                :key="idx"
              >
                <q-item-section class="text-weight-bold" :class="amountColor(entry.amount)">
                  <q-item-label>{{ entry.name }}</q-item-label>
                  <q-item-label caption>{{ new Date(entry.date).toLocaleDateString() }}</q-item-label>
                </q-item-section>
                <q-item-section side top class="text-weight-bold" :class="amountColor(entry.amount)">
                  <q-item-label>{{ formatCurrency(entry.amount) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatCurrency } from 'src/helpers/formatCurrency.js'
import { amountColor } from 'src/helpers/amountColor.js'

// Month names for display
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Example data for each category
const savings = ref([
  { name: 'Salary', amount: 4000, date: '2025-03-10' },
  { name: 'Bonus', amount: 500, date: '2025-03-15' }
])

const expenses = ref([
  { name: 'Rent', amount: -999, date: '2025-03-05' },
  { name: 'Phone', amount: -14.99, date: '2025-03-12' },
  { name: 'Groceries', amount: -120, date: '2025-03-01' }
])

const incomes = ref([
  { name: 'Transfer from Savings', amount: 1000, date: '2025-03-03' },
  { name: 'Bonds', amount: 120, date: '2025-03-07' },
  { name: 'Sold Old Phone', amount: 80, date: '2025-03-10' }
])

// Selected month/year
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())

// Computed: Filter each list by selected month/year
const filteredSavings = computed(() => {
  return savings.value.filter(entry => isInSelectedMonth(entry.date))
})
const filteredExpenses = computed(() => {
  return expenses.value.filter(entry => isInSelectedMonth(entry.date))
})
const filteredIncomes = computed(() => {
  return incomes.value.filter(entry => isInSelectedMonth(entry.date))
})

// Helper to check if entry date is in the selected month/year
function isInSelectedMonth(dateStr) {
  const d = new Date(dateStr)
  return (
    d.getMonth() === selectedMonth.value &&
    d.getFullYear() === selectedYear.value
  )
}

// Return e.g. "January" for the selected month
const currentMonthName = computed(() => {
  return months[selectedMonth.value]
})

// Navigate months
function prevMonth() {
  selectedMonth.value--
  if (selectedMonth.value < 0) {
    selectedMonth.value = 11
    selectedYear.value--
  }
}
function nextMonth() {
  selectedMonth.value++
  if (selectedMonth.value > 11) {
    selectedMonth.value = 0
    selectedYear.value++
  }
}

// Reuse your helpers
</script>

<script>
/**
 * If your Quasar config doesn't support <script setup>, you could switch to
 * a default export. But <script setup> is recommended for Vue 3 + Quasar.
 */
</script>

<style scoped>
/* Example: if you want more spacing/padding, adjust as needed. */
</style>
