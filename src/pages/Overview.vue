<template>
  <q-page :class="isDarkMode ? 'black' : 'bg-grey-1'" class="overview-page">
    <!-- Month/Year Filter & View Toggle -->
    <div class="row justify-between items-center q-my-md q-px-md page-header">
      <div class="row items-center justify-center col" :style="{ 'margin-right': viewMode === 'monthly' ? '70px' : '-180px' }">
        <q-btn icon="arrow_back" flat @click="prevPeriod" />
        <div class="q-mx-md text-h6">
          {{ viewMode === 'monthly' ? `${currentMonthName} ${selectedYear}` : selectedYear }}
        </div>
        <q-btn icon="arrow_forward" flat @click="nextPeriod" />
      </div>
      <q-btn
        flat
        icon="account_balance"
        color="primary"
        @click="toggleCountUnpaidExpenses"
        :class="countUnpaidExpenses ? 'bg-grey-9' : ''"
        style="margin-left:65px;"
      >
      <q-tooltip class="text-body2">
        {{ t('show balance after all expenses are paid') }}
      </q-tooltip>
      </q-btn>
      <!-- Toggle View Mode Button -->
      <q-btn flat @click="toggleViewMode" icon="sync_alt" color="primary">
        <q-tooltip class="text-body2">
          {{ viewMode === 'monthly' ? t('switchToYearlyMode') : t('switchToMonthlyMode') }}
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Balance Overview Table -->
    <div class="row q-px-md q-pb-md">
      <div class="col-12">
        <q-card :class="isDarkMode ? 'bg-grey-10' : 'bg-white'">
          <q-card-section class="card-title-section">
            <div class="text-h6">{{ viewMode === 'yearly' ? `${t('balance')} - ${selectedYear}` : `${t('balance')} - ${currentMonthName} ${selectedYear}` }}</div>
          </q-card-section>
          <q-separator />
          <q-card-section style="max-height: 600px; overflow-y: auto;" class="custom-scroll">
            <q-list bordered separator v-if="!loadingExpenses && !loadingIncomes">
              <q-item v-for="(month, idx) in monthNames" :key="idx">
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ month }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top class="text-weight-bold" :class="amountColor(getMonthBalance(selectedYear, idx))">
                  <q-item-label>{{ formatCurrency(getMonthBalance(selectedYear, idx), 'USD') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div class="q-pa-xs row justify-center items-center q-gutter-sm column" v-if="loadingExpenses || loadingIncomes">
              <q-spinner color="primary" size="3em" :thickness="2" />
              <span class="q-mt-xs">{{ t('loading') }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { formatCurrency } from 'src/helpers/formatCurrency.js'
import { amountColor } from 'src/helpers/amountColor.js'
import { useExpensesStore } from 'src/stores/expensesStore'
import { useIncomesStore } from 'src/stores/incomesStore'
import { useSavingsStore } from 'src/stores/savingsStore'
import { useBalancesStore } from 'src/stores/balancesStore'
import { useThemeStore } from 'src/stores/themeStore'
import { useLangStore } from "src/stores/langStore"
import { storeToRefs } from 'pinia'

const expensesStore = useExpensesStore()
const { entries: expenses, limits } = storeToRefs(expensesStore)

const incomesStore = useIncomesStore()
const { entries: incomes } = storeToRefs(incomesStore)

const savingsStore = useSavingsStore()
const { entries: savings } = storeToRefs(savingsStore)

const balancesStore = useBalancesStore()
const { balanceDict, savingsBalanceDict, hasInitialized, reloadIncomeExpensesDictionary, currentMonthRemainingLimit } = storeToRefs(balancesStore)

const { t } = useLangStore()
const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)

const viewMode = ref("yearly")
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())

const monthNames = computed(() => [
  t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
  t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
])

const getTitle = computed(() => (entry) => entry.title === "No goal" ? t('noGoal') : entry.title)

const loadingExpenses = ref(false)
const loadingIncomes = ref(false)
const loadingSavings = ref(false)

onMounted(async () => {
  if (!hasInitialized.value) {
    loadingExpenses.value = true
    loadingIncomes.value = true
    loadingSavings.value = true

    // ✅ Run all fetches in parallel
    await Promise.all([
      balancesStore.fetchBalances(),
      expensesStore.fetchExpenses(),
      expensesStore.fetchExpenseLimits(),
      incomesStore.fetchIncomes(),
      savingsStore.fetchSavingGoals()
    ])

    // ✅ Create balance dictionaries after all data is loaded
    balancesStore.createIncomeExpensesBalanceDictionary(
      expenses.value, incomes.value, savings.value, countUnpaidExpenses.value
    )
    balancesStore.createSavingsBalanceDictionary(savings.value)
    extendSavingGoalModel()

    loadingExpenses.value = false
    loadingIncomes.value = false
    loadingSavings.value = false
  } else if (reloadIncomeExpensesDictionary.value) {
    balancesStore.createIncomeExpensesBalanceDictionary(
      expenses.value, incomes.value, savings.value, countUnpaidExpenses.value
    )
    balancesStore.createSavingsBalanceDictionary(savings.value)
  }
})

const currentMonthName = computed(() => monthNames.value[selectedMonth.value])

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}
const countUnpaidExpenses = ref(false);
function toggleCountUnpaidExpenses() {
  countUnpaidExpenses.value = !countUnpaidExpenses.value
  reloadIncomeExpensesDictionary.value = true;
  balancesStore.createIncomeExpensesBalanceDictionary(expenses.value, incomes.value, savings.value, countUnpaidExpenses.value, currentYearLimits.value)
}
// Yearly View Computation with Limits as Virtual Expenses for Future Months Only
const yearlyExpenseSummary = (data) => {
  const summary = Array(12).fill(0)
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Actual expenses
  data.value
    .filter(entry => {
      const entryDate = new Date(entry.paymentDate)
      const isYearMatch = entryDate.getFullYear() === selectedYear.value

      return isYearMatch && (countUnpaidExpenses.value || entry.isPaid)
    })
    .forEach(entry => {
      const month = new Date(entry.paymentDate).getMonth()
      if (countUnpaidExpenses.value && entry.expenseCategory && month > currentMonth) {
        return
      }
      summary[month] += entry.amount
    })

  // Add virtual expenses from limits only for future months in the current year
  if (countUnpaidExpenses.value) {
    currentYearLimits.value.forEach(limit => {
      if (
        limit.month != null &&
        limit.month >= 0 &&
        limit.month <= 11 &&
        (selectedYear.value > currentYear || (selectedYear.value === currentYear && limit.month > currentMonth))
      ) {
        summary[limit.month] -= limit.limit
      }
    })
    // apply remaining limits for the current month
    if (selectedYear.value == currentYear) {
      summary[currentMonth] -= currentMonthRemainingLimit.value
    }
  }

  return summary
}

const yearlyIncomesSummary = (data) => {
  const summary = Array(12).fill(0)
  data.value
    .filter(entry => {
      const entryDate = new Date(entry.incomeDate)
      const isYearMatch = entryDate.getFullYear() === selectedYear.value

      return isYearMatch && (countUnpaidExpenses.value || entry.isReceived);
    })
    .forEach(entry => {
      const month = new Date(entry.incomeDate).getMonth()
      summary[month] += entry.amount
  })
  return summary
}

const yearlySavingsSummary = (data) => {
  const contributions = data.value
    .reduce((acc, goal) => acc.concat(goal.savingContributions), []);
  const summary = Array(12).fill(0)
  contributions
    .filter(entry => {
      const entryDate = new Date(entry.contributionDate)
      const isYearMatch = entryDate.getFullYear() === selectedYear.value

      return isYearMatch;
    })
    .forEach(entry => {
      const month = new Date(entry.contributionDate).getMonth()
      summary[month] += entry.amount
    })
  return summary
}

// Get the correct data based on view mode
const displayedExpenses = computed(() => viewMode.value === "yearly" ? yearlyExpenseSummary(expenses) : expenses.value.filter(entry => isInSelectedMonth(entry.paymentDate)))
const displayedIncomes = computed(() => viewMode.value === "yearly" ? yearlyIncomesSummary(incomes) : incomes.value.filter(entry => isInSelectedMonth(entry.incomeDate)))
const displayedSavings = computed(() => viewMode.value === "yearly" ? yearlySavingsSummary(savings) : [])

// Ensure formatCurrency receives a number
function getAmount(entry) {
  return viewMode.value === "yearly" ? entry : entry.amount
}

function getMonthBalance(year, month) {
  return balanceDict.value[year] && balanceDict.value[year][month] ? balanceDict.value[year][month] : 0;
}

function getSavingsMonthBalance(year, month) {
  return savingsBalanceDict.value[year] && savingsBalanceDict.value[year][month] ? savingsBalanceDict.value[year][month] : 0;
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

// Computed totals for summary cards
const getTotalExpenses = () => {
  if (viewMode.value === 'yearly') {
    return yearlyExpenseSummary(expenses).reduce((sum, val) => sum + Math.abs(val), 0)
  }
  return displayedExpenses.value.reduce((sum, entry) => sum + Math.abs(entry.amount), 0)
}

const getTotalIncomes = () => {
  if (viewMode.value === 'yearly') {
    return yearlyIncomesSummary(incomes).reduce((sum, val) => sum + val, 0)
  }
  return displayedIncomes.value.reduce((sum, entry) => sum + entry.amount, 0)
}

const getTotalSavings = () => {
  if (viewMode.value === 'yearly') {
    return yearlySavingsSummary(savings).reduce((sum, val) => sum + val, 0)
  }
  return savings.value.reduce((sum, goal) => {
    const monthContributions = goal.savingContributions?.filter(c => {
      const d = new Date(c.contributionDate)
      return d.getMonth() === selectedMonth.value && d.getFullYear() === selectedYear.value
    }) || []
    return sum + monthContributions.reduce((s, c) => s + c.amount, 0)
  }, 0)
}

const expandedSavingId = ref(null)

function toggleExpand(savingId) {
  expandedSavingId.value = expandedSavingId.value === savingId ? null : savingId;
}

function getSavingStatusIcon(saving) {
  return saving.status === "completed" ? "check_circle"
        : saving.status === "behind" ? "error"
        : "hourglass_top";
}
function getSavingStatusColor(saving) {
  return saving.status === "completed" ? "green-6"
        : saving.status === "behind" ? "red-6"
        : "orange-6";
}

function getProgress(saving) {
  return saving.currentAmount / saving.amount;
}
function getProgressColor(saving) {
  return saving.status === "completed" ? "green"
        : saving.status === "behind" ? "red"
        : "orange";
}

function extendSavingGoalModel() {
  savings.value.forEach(goal => {
    goal.currentAmount = getTotalGoalBalanceFromPreviousMonth(goal.id) + getTotalGoalBalanceFromCurrentMonth(goal.id)
    goal.currentMonthAmountChange = getTotalGoalBalanceFromCurrentMonth(goal.id)
    goal.status = setCurrentProgressStatus(goal.currentAmount, goal.amount)
  })
}

const currentMonthContributions = computed(() => {
  const contributions = savings.value
    .reduce((acc, goal) => acc.concat(goal.savingContributions), []);
  return contributions.filter(entry => {
    const entryDate = new Date(entry.contributionDate)
    const isMonthYearMatch = entryDate.getMonth() === selectedMonth.value && entryDate.getFullYear() === selectedYear.value

    return isMonthYearMatch;
  })
})

const previousMonthContributions = computed(() => {
  const contributions = savings.value
    .reduce((acc, goal) => acc.concat(goal.savingContributions), []);

  return contributions.filter(entry => {
    const entryDate = new Date(entry.contributionDate);

    const isBeforeSelectedMonth =
      entryDate.getFullYear() < selectedYear.value ||
      (entryDate.getFullYear() === selectedYear.value && entryDate.getMonth() < selectedMonth.value);

    return isBeforeSelectedMonth;
  });
});

function getCurrentMonthContributionsByGoalId(id) {
  return currentMonthContributions.value.filter(contribution => contribution.savingGoalId === id)
}

function isAnyGoalContribution(id) {
  const contributions = currentMonthContributions.value.filter(contribution => contribution.savingGoalId === id)
  return contributions && contributions.length > 0;
}

function getTotalGoalBalanceFromCurrentMonth(id) {
  return currentMonthContributions.value.filter(contribution => contribution.savingGoalId === id)
    .reduce((acc, { amount }) => acc + amount, 0)
}

function getTotalGoalBalanceFromPreviousMonth(id) {
  return previousMonthContributions.value.filter(contribution => contribution.savingGoalId === id)
    .reduce((acc, { amount }) => acc + amount, 0)
}

function setCurrentProgressStatus(currentAmount, goalAmount) {
  if (currentAmount >= goalAmount) {
        return "completed";
    } else if (currentAmount >= goalAmount * 0.3) {
        return "on_track";
    } else {
        return "behind";
    }
}

watch([selectedMonth, selectedYear], () => {
  extendSavingGoalModel()
});

const currentYearLimits = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return limits.value.filter(limit => {
    const isSameYear = limit.year === selectedYear.value
    const isFutureMonth =
      selectedYear.value > currentYear ||
      (selectedYear.value === currentYear && limit.month > currentMonth)

    return isSameYear && isFutureMonth
  })
})
</script>

<style scoped lang="scss">
// Modern Overview Page Styling

.overview-page {
  padding-bottom: 24px;
}

// Summary Cards
.summary-card {
  border-radius: 16px;
  border: 1px solid #F0F0F0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 140px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  .q-card__section {
    padding: 20px;
  }

  .card-label {
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #757575;
    margin-bottom: 12px;
  }

  .card-amount {
    font-size: 32px;
    font-weight: 600;
    letter-spacing: -0.5px;
    margin-bottom: 12px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .card-info, .card-trend {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #757575;

    .q-icon {
      font-size: 18px;
    }
  }

  .card-trend {
    &.positive {
      color: #4CAF50;
      .q-icon {
        color: #4CAF50;
      }
    }

    &.negative {
      color: #EF5350;
      .q-icon {
        color: #EF5350;
      }
    }

    &.secondary {
      color: #26A69A;
      .q-icon {
        color: #26A69A;
      }
    }
  }
}

// Balance Card - Special Gradient
.balance-card {
  background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
  color: white;
  border: none;

  .card-label {
    color: rgba(255, 255, 255, 0.9);
  }

  .card-amount {
    color: white;
    font-size: 40px;
  }

  .card-info {
    color: rgba(255, 255, 255, 0.85);

    .q-icon {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

// Income Card - Accent Border
.income-card {
  border-top: 4px solid #4CAF50;
}

// Expense Card - Accent Border
.expense-card {
  border-top: 4px solid #EF5350;
}

// Saving Card - Accent Border
.saving-card {
  border-top: 4px solid #26A69A;
}

// Detail Cards (3-column panels)
.detail-card {
  border-radius: 16px;
  border: 1px solid #F0F0F0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  .card-title-section {
    padding: 20px;

    .text-h6 {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .q-list {
    .q-item {
      padding: 12px 16px;
      border-radius: 0;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.02);
      }
    }
  }
}

// Dark Mode
body.body--dark {
  .summary-card {
    background: #1E1E1E;
    border-color: #3A3A3A;

    .card-label {
      color: #B0B0B0;
    }

    .card-amount {
      color: #FFFFFF;
    }

    .card-info, .card-trend {
      color: #B0B0B0;
    }

    &:hover {
      background: #252525;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
  }

  .balance-card {
    background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
  }

  .detail-card {
    background: #1E1E1E;
    border-color: #3A3A3A;

    .q-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

// Page Header
.page-header {
  .q-btn {
    color: #757575;

    &:hover {
      color: #1E88E5;
      background: rgba(30, 136, 229, 0.08);
    }
  }

  .text-h6 {
    font-weight: 600;
    color: #263238;
  }
}

body.body--dark .page-header {
  .q-btn:hover {
    color: #42A5F5;
    background: rgba(66, 165, 245, 0.12);
  }

  .text-h6 {
    color: #FFFFFF;
  }
}
</style>
