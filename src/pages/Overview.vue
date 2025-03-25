<template>
  <q-page class="bg-grey-1">
    <!-- Month/Year Filter & View Toggle -->
    <div class="row justify-between items-center q-my-md q-px-md">
    <!-- Balance Display with Edit Option (Left-aligned) -->
    <div class="row q-mt-md q-px-md q-py-sm bg-white shadow-2 rounded-borders" v-if="viewMode === 'monthly'">
      <div class="text-h6 q-mr-sm">
        Balance: <span :class="amountColor(balance)">{{ !isEditingBalance ? formatCurrency(balance, 'PLN') : '' }}</span>
      </div>
      <q-input
        v-if="isEditingBalance"
        v-model="balance"
        dense
        bg-color="white"
        type="number"
        class="q-mr-sm q-pa-none"
        style="font-size: 20px; width:140px;height:25px;margin-top: -3px;"
      />
      <q-icon v-if="!isEditingBalance" name="edit" size="sm" color="primary" class="cursor-pointer" @click="editBalance" style="margin-top: 3px;"/>
      <q-icon v-else name="check_circle" size="sm" color="primary" class="cursor-pointer" @click="saveBalance" style="margin-top: 7px;"/>
    </div>
      <div class="row items-center justify-center col" :style="{ 'margin-right': viewMode === 'monthly' ? '115px' : '-180px' }">
        <q-btn icon="arrow_back" flat @click="prevPeriod" />
        <div class="q-mx-md text-h6">
          {{ viewMode === 'monthly' ? `${currentMonthName} ${selectedYear}` : selectedYear }}
        </div>
        <q-btn icon="arrow_forward" flat @click="nextPeriod" />
      </div>

      <!-- Toggle View Mode Button -->
      <q-btn flat dense @click="toggleViewMode">
        {{ viewMode === 'monthly' ? "Switch to Yearly View" : "Switch to Monthly View" }}
      </q-btn>
    </div>

    <!-- Three panels for Savings, Expenses, Incomes -->
    <div class="row q-col-gutter-md q-px-md q-pb-md">
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-center">Savings</div>
          </q-card-section>
          <q-separator />
          <q-card-section style="max-height: 800px; overflow-y: auto;">
            <q-list bordered separator>
              <q-item v-for="(entry, idx) in displayedSavings" :key="idx">
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ viewMode === 'yearly' ? monthNames[idx] : entry.name }}
                  </q-item-label>
                  <q-item-label caption v-if="viewMode === 'monthly'">
                    {{ formatDate(entry.date) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top class="text-weight-bold text-positive">
                  <q-item-label v-if="viewMode === 'yearly'"><q-icon name="account_balance"/> {{ formatCurrency(10000, 'PLN', true) }}</q-item-label>
                  <q-item-label>{{ formatCurrency(getAmount(entry, idx), viewMode === 'monthly' ? entry.currency : 'PLN') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-center">Expenses</div>
          </q-card-section>
          <q-separator />
          <q-card-section style="max-height: 800px; overflow-y: auto;">
            <q-list bordered separator>
              <q-item v-for="(entry, idx) in displayedExpenses" :key="idx">
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ viewMode === 'yearly' ? monthNames[idx] : entry.name }}
                  </q-item-label>
                  <q-item-label caption v-if="viewMode === 'monthly'">
                    {{ formatDate(entry.date) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top class="text-weight-bold text-negative">
                  <q-item-label v-if="viewMode === 'yearly'"><q-icon name="account_balance"/> {{ formatCurrency(10000, 'PLN', true) }}</q-item-label>
                  <q-item-label>{{ formatCurrency(getAmount(entry, idx), viewMode === 'monthly' ? entry.currency : 'PLN') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-center">Incomes</div>
          </q-card-section>
          <q-separator />
          <q-card-section style="max-height: 800px; overflow-y: auto;">
            <q-list bordered separator>
              <q-item v-for="(entry, idx) in displayedIncomes" :key="idx">
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ viewMode === 'yearly' ? monthNames[idx] : entry.name }}
                  </q-item-label>
                  <q-item-label caption v-if="viewMode === 'monthly'">
                    {{ formatDate(entry.date) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top class="text-weight-bold text-positive">
                  <q-item-label v-if="viewMode === 'yearly'"><q-icon name="account_balance" style="margin-bottom: 2px;"/>  {{ formatCurrency(10000, 'PLN', true) }}</q-item-label>
                  <q-item-label>{{ formatCurrency(getAmount(entry, idx), viewMode === 'monthly' ? entry.currency : 'PLN') }}</q-item-label>
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

const viewMode = ref("monthly")

const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const savings = ref([
  { name: 'Salary', amount: 4000, date: '2025-01-10', currency: 'PLN' },
  { name: 'Bonus', amount: 500, date: '2025-03-15', currency: 'PLN'  },
  { name: 'Investment', amount: 1000, date: '2025-03-20', currency: 'PLN'  }
])

const expenses = ref([
  { name: 'Rent', amount: -999, date: '2025-01-05', currency: 'PLN'  },
  { name: 'Phone', amount: -14.99, date: '2025-02-12', currency: 'PLN'  },
  { name: 'Groceries', amount: -120, date: '2025-03-01', currency: 'PLN'  }
])

const incomes = ref([
  { name: 'Freelance', amount: 2000, date: '2025-01-03', currency: 'PLN'  },
  { name: 'Bonds', amount: 120, date: '2025-02-07', currency: 'PLN'  },
  { name: 'Gift', amount: 500, date: '2025-03-10', currency: 'PLN'  }
])

const currentMonthName = computed(() => monthNames[selectedMonth.value])

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

// Yearly View Computation
const yearlySummary = (data) => {
  const summary = Array(12).fill(0)
  data.value.forEach(entry => {
    const month = new Date(entry.date).getMonth()
    summary[month] += entry.amount
  })
  return summary
}

// Get the correct data based on view mode
const displayedSavings = computed(() => viewMode.value === "yearly" ? yearlySummary(savings) : savings.value.filter(entry => isInSelectedMonth(entry.date)))
const displayedExpenses = computed(() => viewMode.value === "yearly" ? yearlySummary(expenses) : expenses.value.filter(entry => isInSelectedMonth(entry.date)))
const displayedIncomes = computed(() => viewMode.value === "yearly" ? yearlySummary(incomes) : incomes.value.filter(entry => isInSelectedMonth(entry.date)))

// Ensure formatCurrency receives a number
function getAmount(entry, idx) {
  return viewMode.value === "yearly" ? entry : entry.amount
}

// Check if entry is in the selected month
function isInSelectedMonth(dateStr) {
  const d = new Date(dateStr)
  return d.getMonth() === selectedMonth.value && d.getFullYear() === selectedYear.value
}

// Toggle between Monthly and Yearly views
function toggleViewMode() {
  viewMode.value = viewMode.value === "monthly" ? "yearly" : "monthly"
}

// Navigate months/years
function prevPeriod() {
  if (viewMode.value === "monthly") {
    selectedMonth.value--
    if (selectedMonth.value < 0) {
      selectedMonth.value = 11
      selectedYear.value--
    }
  } else {
    selectedYear.value--
  }
}

function nextPeriod() {
  if (viewMode.value === "monthly") {
    selectedMonth.value++
    if (selectedMonth.value > 11) {
      selectedMonth.value = 0
      selectedYear.value++
    }
  } else {
    selectedYear.value++
  }
}


const balance = ref(6000)
const isEditingBalance = ref(false)
function editBalance() {
  isEditingBalance.value = true
}

function saveBalance() {
  isEditingBalance.value = false
}
</script>
