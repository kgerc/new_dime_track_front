<template>
  <q-page style="margin-left: 20px;" :style="isDarkMode ? 'background-color: black;' : 'background-color: #f5f5f5;'">
    <!-- Month/Year Filter & View Toggle -->
    <div class="row justify-between items-center q-my-md q-px-md">
      <div class="row items-center justify-center col" style="margin-right: -180px;">
        <q-btn icon="arrow_back" flat @click="prevPeriod" />
        <div class="q-mx-md text-h6">
          {{ viewMode === 'monthly' ? `${currentMonthName} ${selectedYear}` : selectedYear }}
        </div>
        <q-btn icon="arrow_forward" flat @click="nextPeriod" />
      </div>
      <q-btn flat @click="toggleViewMode" icon="sync_alt" color="primary">
        <q-tooltip class="text-body2">
          {{ viewMode === 'monthly' ? t('switchToYearlyMode') : t('switchToMonthlyMode') }}
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-xl">
      <!-- Income Card -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="summary-card income-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey">{{ t('totalIncome') }}</div>
              <q-icon name="trending_up" color="positive" size="20px" />
            </div>

            <div class="text-h5 text-positive text-weight-bold">{{ summaryIncome }}</div>

            <!-- Projected income bar -->
            <div class="q-mt-md">
              <div class="row items-center justify-between text-body2 text-grey-7">
                <span>{{ t('incomeStability') }}</span>
                <span class="text-positive">{{ incomeStabilityLabel }}</span>
              </div>
              <q-linear-progress
                color="positive"
                size="6px"
                rounded
                :value="incomeStabilityIndex"
                class="q-mt-xs"
              />
            </div>

            <!-- Growth percentage -->
            <div class="row items-center q-mt-md text-body2 text-grey-7">
              <q-icon name="north_east" size="18px" color="positive" class="q-mr-xs" />
              <span>{{ t('incomeGrowth') }}:</span>
              <span class="text-positive q-ml-xs">{{ incomeGrowthLabel }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Expenses Card -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="summary-card expense-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey">{{ t('totalExpenses') }}</div>
              <q-icon name="trending_down" color="negative" size="20px" />
            </div>

            <div class="text-h5 text-negative text-weight-bold">{{ summaryExpenses }}</div>

            <!-- Over Budget Progress -->
            <div class="q-mt-md">
              <div class="row items-center justify-between text-body2 text-grey-7">
                <span>{{ t('overBudget') }}</span>
                <span class="text-negative">{{ overBudgetLabel }}</span>
              </div>
              <q-linear-progress
                color="negative"
                size="6px"
                rounded
                :value="overBudgetValue"
                class="q-mt-xs"
              />
            </div>

            <!-- Expense growth -->
            <div class="row items-center q-mt-md text-body2 text-grey-7">
              <q-icon name="south_east" size="18px" color="orange" class="q-mr-xs" />
              <span>{{ t('expenseGrowth') }}:</span>
              <span class="text-orange q-ml-xs">{{ expenseGrowthLabel }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Savings Card -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="summary-card saving-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey">{{ t('totalSavings') }}</div>
              <q-icon name="savings" color="primary" size="20px" />
            </div>

            <div class="text-h5 text-weight-bold text-primary">{{ summarySavings }}</div>

            <!-- Percent of income saved -->
            <div class="q-mt-md">
              <div class="row items-center justify-between text-body2 text-grey-7">
                <span>{{ Math.round(savingsPercent * 100) }}% {{ t('ofIncomeSaved') }}</span>
              </div>
              <q-linear-progress
                size="10px"
                class="q-mt-xs"
                color="primary"
                :value="savingsPercent"
                rounded
              />
            </div>

            <!-- Remaining to goals -->
            <div class="row items-center q-mt-md text-body2 text-grey-7">
              <q-icon name="flag" size="18px" color="accent" class="q-mr-xs" />
              <span>{{ t('remainingToGoals') }}:</span>
              <span class="text-negative q-ml-xs">{{ remainingToGoalsLabel }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs v-model="activeTab" dense align="left" class="text-primary q-px-md" style="margin-left: 20px;">
      <q-tab name="all" label="All"/>
      <q-tab name="overview" label="Overview" />
      <q-tab name="spending" label="Spending" />
      <q-tab name="income" label="Income" />
      <q-tab name="savings" label="Savings" />
      <q-tab name="balance" label="Balance" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated class="q-px-md q-mt-md" :style="isDarkMode ? 'background-color: black;' : 'background-color: #f5f5f5;'">
      <q-tab-panel name="overview">
        <div class="row justify-center">
          <q-card class="col-12 col-md-7 q-pa-sm q-mb-md summary-card" style="max-width: 1000px; border-radius: 16px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('incomeVsExpenses') }}</div>
              <apexchart :key="chartKey" type="bar" height="450" width="900" :options="barOptions" :series="barSeries" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="spending">
        <div class="row justify-center">
          <q-card
            class="col-12 col-md-6 q-pa-sm q-mb-md summary-card"
            :style="{
              maxWidth: viewMode === 'yearly' ? '900px' : '500px',
              borderRadius: '16px'
            }"
          >
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('spendingBreakdown') }}</div>
              <apexchart
                :key="chartKey"
                type="pie"
                height="450"
                :width="viewMode === 'yearly' ? 800 : 450"
                :options="pieOptions"
                :series="pieSeries"
              />
            </q-card-section>
          </q-card>
          <q-card v-if="viewMode === 'monthly'" class="col-12 col-md-6 q-pa-sm q-mb-md summary-card" style="max-width: 500px; border-radius: 16px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('expenseLimitTracking') }}</div>
              <apexchart :key="chartKey" type="bar" height="450" width="450" :options="limitOptions" :series="limitSeries" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="income">
        <div class="row justify-center">
          <q-card class="col-12 col-md-7 q-pa-sm q-mb-md summary-card" style="max-width: 1000px; border-radius: 16px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('incomeCategories') }}</div>
              <apexchart :key="chartKey" type="bar" height="450" width="900" :options="barOptions" :series="[barSeries[0]]" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="savings">
        <div class="row justify-center">
          <q-card class="col-12 col-md-7 q-pa-sm q-mb-md summary-card" style="max-width: 1000px; border-radius: 16px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('savingsOverTime') }}</div>
              <apexchart :key="chartKey" type="line" height="450" width="900" :options="lineOptions" :series="lineSeries" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="balance">
        <!-- Balance Chart -->
        <div class="row justify-center">
          <q-card class="col-12 col-md-9 q-pa-sm summary-card" style="max-width: 1000px; border-radius: 16px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('balanceOverTime') }}</div>
              <apexchart :key="chartKey" type="line" height="450" width="900" :options="balanceOptions" :series="balanceSeries" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="all">
        <div class="row q-gutter-md justify-center">
          <q-card class="col-12 col-md-3 q-pa-sm q-mb-md summary-card" style="max-width: 342px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('incomeVsExpenses') }}</div>
              <apexchart :key="chartKey" type="bar" height="250" :options="barOptions" :series="barSeries" />
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-3 q-pa-sm q-mb-md summary-card" style="max-width: 342px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('spendingBreakdown') }}</div>
              <apexchart :key="chartKey" type="pie" height="250" :options="pieOptions" :series="pieSeries" />
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-3 q-pa-sm q-mb-md summary-card" style="max-width: 342px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('expenseLimitTracking') }}</div>
              <apexchart :key="chartKey" type="bar" height="250" :options="limitOptions" :series="limitSeries" />
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-3 q-pa-sm q-mb-md summary-card" style="max-width: 342px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('incomeCategories') }}</div>
              <apexchart :key="chartKey" type="bar" height="250" :options="barOptions" :series="[barSeries[0]]" />
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-3 q-pa-sm q-mb-md summary-card" style="max-width: 342px;">
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm">{{ t('savingsOverTime') }}</div>
              <apexchart :key="chartKey" type="line" height="250" :options="lineOptions" :series="lineSeries" />
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<style scoped>
.summary-card {
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
  min-height: 150px;
}

.summary-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

/* Light color accents for visual distinction */
.income-card {
  border-top: 4px solid var(--q-positive);
}
.expense-card {
  border-top: 4px solid var(--q-negative);
}
.saving-card {
  border-top: 4px solid var(--q-primary);
}
</style>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import ApexCharts from 'vue3-apexcharts'
import { useLangStore } from 'src/stores/langStore'
import { useThemeStore } from 'src/stores/themeStore'
import { useExpensesStore } from 'src/stores/expensesStore'
import { useIncomesStore } from 'src/stores/incomesStore'
import { useSavingsStore } from 'src/stores/savingsStore'
import { useBalancesStore } from 'src/stores/balancesStore'
import { formatCurrency } from 'src/helpers/formatCurrency.js'

const apexchart = ApexCharts
const { t } = useLangStore()
const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)

const expensesStore = useExpensesStore()
const { entries: expenses, limits } = storeToRefs(expensesStore)

const incomesStore = useIncomesStore()
const { entries: incomes } = storeToRefs(incomesStore)

const savingsStore = useSavingsStore()
const { entries: savings } = storeToRefs(savingsStore)

const balancesStore = useBalancesStore()
const { balanceDict, savingsBalanceDict, hasInitialized, reloadIncomeExpensesDictionary, currentMonthRemainingLimit } = storeToRefs(balancesStore)

const viewMode = ref('monthly')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth())
const activeTab = ref('all')
const chartKey = ref(0)

onMounted(() => {
  setTimeout(() => {
    chartKey.value++
  }, 100)
})

watch([activeTab, viewMode, selectedMonth, selectedYear, expenses, incomes, savings], () => {
  // re-render charts if any underlying key changes
  chartKey.value++
})

// month labels
const monthNames = computed(() => [
  t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
  t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
])
const currentMonthName = computed(() => monthNames.value[selectedMonth.value])

// --- Helpers used to build series/totals ---

// Yearly summaries (arrays of 12 numbers)
function yearlyExpenseSummary(dataRef) {
  const summary = Array(12).fill(0)
  dataRef.value.forEach(entry => {
    const d = new Date(entry.paymentDate)
    if (d.getFullYear() === selectedYear.value && (entry.isPaid || true)) {
      summary[d.getMonth()] += roundToTwo(entry.amount)
    }
  })
  return summary.map(roundToTwo)
}

function yearlyIncomesSummary(dataRef) {
  const summary = Array(12).fill(0)
  dataRef.value.forEach(entry => {
    const d = new Date(entry.incomeDate)
    if (d.getFullYear() === selectedYear.value && (entry.isReceived || true)) {
      summary[d.getMonth()] += roundToTwo(entry.amount)
    }
  })
  return summary.map(roundToTwo)
}

function yearlySavingsSummary(dataRef) {
  const contributions = dataRef.value.reduce((acc, goal) => acc.concat(goal.savingContributions || []), [])
  const summary = Array(12).fill(0)
  contributions.forEach(entry => {
    const d = new Date(entry.contributionDate)
    if (d.getFullYear() === selectedYear.value) {
      summary[d.getMonth()] += roundToTwo(entry.amount)
    }
  })
  return summary.map(roundToTwo)
}

// Monthly totals
const totalIncomeForSelectedMonth = computed(() => {
  if (viewMode.value === 'yearly') return roundToTwo(yearlyIncomesSummary(incomes).reduce((a,b)=>a+b,0))
  return roundToTwo(
    incomes.value
      .filter(i => {
        const d = new Date(i.incomeDate)
        return d.getFullYear() === selectedYear.value && d.getMonth() === selectedMonth.value
      })
      .reduce((acc, i) => acc + roundToTwo(i.amount), 0)
  )
})

const totalExpensesForSelectedMonth = computed(() => {
  if (viewMode.value === 'yearly') return roundToTwo(yearlyExpenseSummary(expenses).reduce((a,b)=>a+b,0))
  return roundToTwo(
    expenses.value
      .filter(e => {
        const d = new Date(e.paymentDate)
        return d.getFullYear() === selectedYear.value && d.getMonth() === selectedMonth.value && (e.isPaid || true)
      })
      .reduce((acc, e) => acc + roundToTwo(e.amount), 0)
  )
})

const totalSavingsForSelectedMonth = computed(() => {
  if (viewMode.value === 'yearly') return roundToTwo(yearlySavingsSummary(savings).reduce((a,b)=>a+b,0))
  const contributions = savings.value.reduce((acc, goal) => acc.concat(goal.savingContributions || []), [])
  return roundToTwo(
    contributions
      .filter(c => {
        const d = new Date(c.contributionDate)
        return d.getFullYear() === selectedYear.value && d.getMonth() === selectedMonth.value
      })
      .reduce((acc, c) => acc + roundToTwo(c.amount), 0)
  )
})

// formatted summary strings (keeps UI similar to original)
const summaryIncome = computed(() => formatCurrency(totalIncomeForSelectedMonth.value || 0, 'PLN'))
const summaryExpenses = computed(() => formatCurrency(totalExpensesForSelectedMonth.value || 0, 'PLN'))
const summarySavings = computed(() => formatCurrency(totalSavingsForSelectedMonth.value || 0, 'PLN'))


const previousIncome = computed(() => {
  if (viewMode.value === 'yearly') {
    return yearlyIncomesSummary(incomes).reduce((a, b) => a + b, 0) // previous year not available in simple demo
  }

  const prevMonth = selectedMonth.value === 0 ? 11 : selectedMonth.value - 1
  const prevYear = selectedMonth.value === 0 ? selectedYear.value - 1 : selectedYear.value

  return incomes.value
    .filter(i => {
      const d = new Date(i.incomeDate)
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth
    })
    .reduce((acc, i) => acc + i.amount, 0)
})

// total "regular" income (you can adjust category names)
const totalRegularIncomeForYear = computed(() => {
  return incomes.value
    .filter(i => {
      const d = new Date(i.incomeDate)
      return d.getFullYear() === selectedYear.value
    })
    .reduce((acc, i) => acc + i.amount, 0)
})

const averageRegularIncomePerMonth = computed(() => {
  return Math.round(totalRegularIncomeForYear.value / 12)
})

// Income Stability Index in %
const incomeStabilityIndex = computed(() => {
  const total = totalIncomeForSelectedMonth.value
  const avg = averageRegularIncomePerMonth.value
  if (avg === 0) return 0
  return total / avg;
})

// Display label as chip
const incomeStabilityLabel = computed(() => {
  const total = totalIncomeForSelectedMonth.value
  if (total === 0) return 0;
  let ratio = total / averageRegularIncomePerMonth.value;
  if (ratio > 1) ratio = 1;
  return `${Math.round(ratio * 100)}%`;
})

// --- Growth Labels ---
const incomeGrowthLabel = computed(() => {
  const prev = previousIncome.value
  const curr = totalIncomeForSelectedMonth.value
  if (!prev || prev === 0) return '+0%'
  const growth = ((curr - prev) / prev) * 100
  const sign = growth >= 0 ? '+' : ''
  return `${sign}${growth.toFixed(1)}%`
})

const previousExpenses = computed(() => {
  if (viewMode.value === 'yearly') {
    return yearlyExpenseSummary(expenses).reduce((a, b) => a + b, 0)
  }

  const prevMonth = selectedMonth.value === 0 ? 11 : selectedMonth.value - 1
  const prevYear = selectedMonth.value === 0 ? selectedYear.value - 1 : selectedYear.value

  return expenses.value
    .filter(e => {
      const d = new Date(e.paymentDate)
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth
    })
    .reduce((acc, e) => acc + e.amount, 0)
})

const expenseGrowthLabel = computed(() => {
  const prev = previousExpenses.value
  const curr = totalExpensesForSelectedMonth.value
  if (!prev || prev === 0) return '+0%'
  const growth = ((curr - prev) / prev) * 100
  const sign = growth >= 0 ? '+' : ''
  return `${sign}${growth.toFixed(1)}%`
})

// over budget calculation
// --- Over Budget ---
const overBudgetAmount = computed(() => {
  return (totalExpensesForSelectedMonth.value * -1) - totalIncomeForSelectedMonth.value;
})

const overBudgetLabel = computed(() => {
  if (overBudgetAmount.value <= 0) return t('noOverBudget')
  return formatCurrency(overBudgetAmount.value * -1, 'PLN')
})

const overBudgetValue = computed(() => {
  return totalExpensesForSelectedMonth.value / totalIncomeForSelectedMonth.value * -1;
})

// savings percent
const savingsPercent = computed(() => {
  const income = totalIncomeForSelectedMonth.value
  if (!income || income === 0) return 0
  return Math.min(1, totalSavingsForSelectedMonth.value / income)
})

// remaining to goals (naive: sum of goal amounts minus current amount)
const remainingToGoalsLabel = computed(() => {
  const goals = savings.value || []
  const remaining = goals.reduce((acc, g) => {
    const goalAmount = roundToTwo(g.amount || 0)
    const contributed = (g.savingContributions || []).reduce((s,a)=>s + roundToTwo(a.amount || 0), 0)
    return acc + Math.max(0, goalAmount - contributed)
  }, 0)
  return formatCurrency(roundToTwo(remaining), 'PLN')
})

// --- Chart data ---

// PIE: expense distribution by category
const pieDataByCategoryMonthly = computed(() => {
  const map = new Map()
  expenses.value.forEach(e => {
    const d = new Date(e.paymentDate)
    const isMatch = viewMode.value === 'yearly'
      ? d.getFullYear() === selectedYear.value
      : (d.getFullYear() === selectedYear.value && d.getMonth() === selectedMonth.value)
    if (!isMatch) return
    const categoryName = (e.expenseCategory && e.expenseCategory.title) ? e.expenseCategory.title : t('other')
    map.set(categoryName, roundToTwo((map.get(categoryName) || 0) + (roundToTwo(e.amount) * -1)))
  })
  const labels = Array.from(map.keys())
  const series = Array.from(map.values())
  if (labels.length === 0) return { labels: [t('noData')], series: [0] }
  return { labels, series }
})

const pieSeries = computed(() => pieDataByCategoryMonthly.value.series)
const pieOptions = computed(() => ({
  labels: pieDataByCategoryMonthly.value.labels,
  legend: { position: 'bottom', labels: { colors: '#999' } },
  responsive: [{ breakpoint: 480, options: { chart: { width: 300 } } }]
}))

// BAR: income vs expenses
const barSeries = computed(() => {
  if (viewMode.value === 'yearly') {
    const incomesYearly = yearlyIncomesSummary(incomes)
    const expensesYearly = yearlyExpenseSummary(expenses)
    return [
      { name: 'Income', data: incomesYearly },
      { name: 'Expenses', data: expensesYearly }
    ]
  } else {
    // monthly: single value arrays for selected month
    const inc = totalIncomeForSelectedMonth.value || 0
    const exp = totalExpensesForSelectedMonth.value || 0
    return [
      { name: 'Income', data: [inc] },
      { name: 'Expenses', data: [exp] }
    ]
  }
})

const barOptions = computed(() => ({
  chart: { stacked: false , foreColor: '#999' },
    dataLabels: {
    enabled: false // ❌ hides numbers directly on the pie slices
  },
  tooltip: {
    enabled: true // ✅ keeps hover tooltips with numbers
  },
  xaxis: {
    categories: viewMode.value === 'monthly'
      ? [monthNames.value[selectedMonth.value]]
      : monthNames.value,
    labels: { style: { colors: '#999' } }
  },
  yaxis: { labels: { style: { colors: '#999' } } },
  plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
  colors: ['#21BA45', '#DB2828']
}))

// LINE: savings over time
const lineSeries = computed(() => {
  if (viewMode.value === 'yearly') {
    const savingsYearly = yearlySavingsSummary(savings)
    return [{ name: 'Savings', data: savingsYearly }]
  } else {
    // monthly view: single point representing savings in the selected month
    return [{ name: 'Savings', data: [totalSavingsForSelectedMonth.value || 0] }]
  }
})

const lineOptions = computed(() => ({
  chart: { stacked: false , foreColor: '#999' },
  xaxis: {
    categories: viewMode.value === 'monthly' ? [monthNames.value[selectedMonth.value]] : monthNames.value,
    labels: { style: { colors: '#999' } }
  },
  yaxis: { labels: { style: { colors: '#999' } } },
  stroke: { curve: 'smooth' },
  colors: ['#007BFF']
}))

// LIMITS / tracking: creates actual vs limit per category for current year or month
const currentYearLimits = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return (limits.value || []).filter(limit => {
    const isSameYear = limit.year === selectedYear.value
    const isFutureMonth =
      selectedYear.value > currentYear ||
      (selectedYear.value === currentYear && limit.month > currentMonth)

    // include limits for yearly view (all months), for monthly only include limits for the selected month
    if (viewMode.value === 'yearly') {
      return isSameYear
    } else {
      return isSameYear && limit.month === selectedMonth.value
    }
  })
})

const limitCategories = computed(() => {
  // categories from limits; fallback to top spending categories if no limits
  if ((currentYearLimits.value || []).length > 0) {
    return currentYearLimits.value.map(l => l.expenseCategory.title || l.category || t('other'))
  }
  // fallback: take top 5 expense categories in the period
  const labels = pieDataByCategoryMonthly.value.labels || []
  return labels.slice(0, 5)
})

const limitSeries = computed(() => {
  // Actuals correspond to categories
  const actuals = limitCategories.value.map(cat => {
    // compute actual spending for that category in the selected period
    const sum = expenses.value
      .filter(e => {
        const d = new Date(e.paymentDate)
        const isMatch = (viewMode.value === 'yearly')
          ? d.getFullYear() === selectedYear.value
          : (d.getFullYear() === selectedYear.value && d.getMonth() === selectedMonth.value)
        if (!isMatch) return false
        const categoryName = (e.expenseCategory && e.expenseCategory.title) ? e.expenseCategory.title : t('other')
        return categoryName === cat
      })
      .reduce((acc, e) => roundToTwo(acc) + roundToTwo(e.amount), 0)
    debugger;
    return roundToTwo(sum * -1);
  })

  // limits values (align with categories)
  const limitsVals = limitCategories.value.map(cat => {
    const found = (currentYearLimits.value || []).find(l => l.expenseCategory.title === cat)
    return found ? (found.limit || 0) : 0
  })

  // return series array expected by apex: first Actual, second Limit
  return [
    { name: 'Actual', data: actuals },
    { name: 'Limit', data: limitsVals }
  ]
})

const limitOptions = {
  chart: { type: 'bar', stacked: false, toolbar: { show: false } },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '60%',
      dataLabels: { position: 'top' }
    }
  },
  xaxis: {
    categories: limitCategories.value,
    max: undefined,
    labels: { style: { colors: '#999' } }
  },
  yaxis: { labels: { style: { colors: '#999' } } },
  colors: ['#007BFF', '#FFA500'],
  dataLabels: {
    enabled: true,
    formatter: val => `${val}`
  },
  grid: {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: false } }
  }
}

// BALANCE series - uses balancesStore.balanceDict (monthly balances)
const balanceSeries = computed(() => {
  if (viewMode.value === 'yearly') {
    // Build an array of monthly balances for the selected year
    const months = monthNames.value.map((_, idx) => {
      return balanceDict.value[selectedYear.value] && typeof balanceDict.value[selectedYear.value][idx] !== 'undefined'
        ? balanceDict.value[selectedYear.value][idx]
        : 0
    })
    return [{ name: 'Balance', data: months }]
  } else {
    // monthly: show single value (selected month)
    const v = balanceDict.value[selectedYear.value] && typeof balanceDict.value[selectedYear.value][selectedMonth.value] !== 'undefined'
      ? balanceDict.value[selectedYear.value][selectedMonth.value]
      : 0
    return [{ name: 'Balance', data: [v] }]
  }
})

const balanceOptions = computed(() => ({
  chart: { type: 'line', height: 300, foreColor: '#999' },
  stroke: { curve: 'smooth' },
  xaxis: {
    categories: viewMode.value === 'monthly'
      ? [monthNames.value[selectedMonth.value]]
      : monthNames.value,
    labels: { style: { colors: '#999' } }
  },
  yaxis: { labels: { style: { colors: '#999' } } },
  colors: ['#00C853'],
  tooltip: { y: { formatter: val => `${val} zł` } }
}))

// UI helpers for toggling and navigation
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'monthly' ? 'yearly' : 'monthly'
}
const prevPeriod = () => {
  if (viewMode.value === 'monthly') {
    if (selectedMonth.value === 0) {
      selectedMonth.value = 11
      selectedYear.value--
    } else {
      selectedMonth.value--
    }
  } else {
    selectedYear.value--
  }
}
const nextPeriod = () => {
  if (viewMode.value === 'monthly') {
    if (selectedMonth.value === 11) {
      selectedMonth.value = 0
      selectedYear.value++
    } else {
      selectedMonth.value++
    }
  } else {
    selectedYear.value++
  }
}

function roundToTwo(num) {
  if (isNaN(num)) return 0
  return Math.round((num + Number.EPSILON) * 100) / 100
}

</script>
