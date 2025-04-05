<template>
  <q-page :class="isDarkMode ? 'black' : 'bg-grey-1'">
    <!-- Month/Year Filter & View Toggle -->
    <div class="row justify-between items-center q-my-md q-px-md ">
    <!-- Balance Display with Edit Option (Left-aligned) -->
    <div class="row q-mt-md q-px-md q-py-sm shadow-2 rounded-borders" :class="isDarkMode ? 'bg-grey-10' : 'bg-white'" v-if="viewMode === 'monthly'">
      <div class="text-h6 q-mr-sm">
        <q-icon name="account_balance" size="md" color="grey" style="margin-top: -5px;">                
          <q-tooltip anchor="top middle" self="bottom middle">
            <div class="text-caption">{{t('balance')}}</div>
          </q-tooltip>
        </q-icon> 
        <span :class="amountColor(balance)" style="margin-left: 5px;">{{ !isEditingBalance ? formatCurrency(balance, 'PLN') : '' }}</span>
      </div>
      <q-input
        v-if="isEditingBalance"
        v-model="balance"
        dense
        bg-color="white"
        type="number"
        class="q-mr-sm q-pa-none"
        style="font-size: 20px; width:132.8px;height:25px;margin-top: -3px;"
      />
      <q-icon v-if="!isEditingBalance" name="edit" size="sm" color="primary" class="cursor-pointer" @click="editBalance" style="margin-top: 3px;"/>
      <q-icon v-else name="check_circle" size="sm" color="primary" class="cursor-pointer" @click="saveBalance" style="margin-top: 7px;"/>
    </div>
      <div class="row items-center justify-center col" :style="{ 'margin-right': viewMode === 'monthly' ? '70px' : '-180px' }">
        <q-btn icon="arrow_back" flat @click="prevPeriod" />
        <div class="q-mx-md text-h6">
          {{ viewMode === 'monthly' ? `${currentMonthName} ${selectedYear}` : selectedYear }}
        </div>
        <q-btn icon="arrow_forward" flat @click="nextPeriod" />
      </div>

      <!-- Toggle View Mode Button -->
      <q-btn flat dense @click="toggleViewMode">
        {{ viewMode === 'monthly' ? t('switchToYearlyMode') : t('switchToMonthlyMode') }}
      </q-btn>
    </div>

    <!-- Three panels for Savings, Expenses, Incomes -->
    <div class="row q-col-gutter-md q-px-md q-pb-md">
      <div class="col-12 col-md-4">
        <q-card :class="isDarkMode ? 'bg-grey-10' : 'bg-white'">
          <q-card-section>
            <div class="text-h6 text-center">{{ t('expenses') }}</div>
          </q-card-section>
          <q-separator />
          <q-card-section style="max-height: 713px; overflow-y: auto;" class="custom-scroll">
            <q-list bordered separator v-if="!loadingExpenses">
              <q-item v-for="(entry, idx) in displayedExpenses" :key="idx">
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ viewMode === 'yearly' ? monthNames[idx] : entry.title }}
                  </q-item-label>
                  <q-item-label caption v-if="viewMode === 'monthly'">
                    {{ formatDate(entry.paymentDate) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top class="text-weight-bold text-negative">
                  <q-item-label>{{ formatCurrency(getAmount(entry), viewMode === 'monthly' ? entry.currency : 'PLN') }}</q-item-label>
                  <q-item-label v-if="viewMode === 'yearly'" class="text-grey-6"><q-icon name="account_balance"/> 
                    {{ formatCurrency(getMonthBalance(selectedYear, idx), 'PLN', true) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div class="q-pa-xs row justify-center items-center q-gutter-sm column" v-if="loadingExpenses">
              <q-spinner
                color="primary"
                size="3em"
                :thickness="2"
              />
              <span class="q-mt-xs">{{ t('loadingExpenses') }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card :class="isDarkMode ? 'bg-grey-10' : 'bg-white'">
          <q-card-section>
            <div class="text-h6 text-center">{{ t('incomes') }}</div>
          </q-card-section>
          <q-separator />
          <q-card-section style="max-height: 800px; overflow-y: auto;" class="custom-scroll">
            <q-list bordered separator v-if="!loadingIncomes">
              <q-item v-for="(entry, idx) in displayedIncomes" :key="idx">
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ viewMode === 'yearly' ? monthNames[idx] : entry.title }}
                  </q-item-label>
                  <q-item-label caption v-if="viewMode === 'monthly'">
                    {{ formatDate(entry.incomeDate) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top class="text-weight-bold text-positive">
                  <q-item-label>{{ formatCurrency(getAmount(entry), viewMode === 'monthly' ? entry.currency : 'PLN') }}</q-item-label>
                  <q-item-label v-if="viewMode === 'yearly'" class="text-grey-6"><q-icon name="account_balance" style="margin-bottom: 2px;"/> 
                      {{ formatCurrency(getMonthBalance(selectedYear, idx), 'PLN', true) }} 
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div class="q-pa-xs row justify-center items-center q-gutter-sm column" v-if="loadingIncomes">
              <q-spinner
                color="primary"
                size="3em"
                :thickness="2"
              />
              <span class="q-mt-xs">{{ t('loadingIncomes') }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card :class="isDarkMode ? 'bg-grey-10' : 'bg-white'">
          <q-card-section>
        <div class="text-h6 text-center">{{ t('savings') }}</div>
          </q-card-section>
          <q-separator />
          <q-card-section style="max-height: 713px; overflow-y: auto;" class="custom-scroll">
            <q-list bordered separator v-if="viewMode === 'monthly' && !loadingSavings">
              <template v-for="entry in savings" :key="entry.id">
                <q-item clickable @click="toggleExpand(entry.id)">
                  <q-item-section>
                    <div class="row items-center">
                      <q-icon 
                        :name="getSavingStatusIcon(entry)" 
                        :color="getSavingStatusColor(entry)" 
                        class="q-mr-sm" size="sm"
                      />
                      <div>
                        <!-- Saving Title -->
                        <q-item-label class="text-weight-bold">{{ getTitle(entry) }}</q-item-label>
                        <!-- Amounts -->
                        <q-item-label caption v-if="entry.amount">
                          {{ formatCurrency(entry.currentAmount, entry.currency, true) }} / {{ formatCurrency(entry.amount, entry.currency, true) }}
                        </q-item-label>
                        <q-item-label caption v-else>
                          {{ formatCurrency(entry.currentAmount, entry.currency, true) }} (No Goal)
                        </q-item-label>
                        <!-- Progress Bar -->
                        <q-linear-progress
                          v-if="entry.amount"
                          :value="getProgress(entry)"
                          :color="getProgressColor(entry)"
                          class="q-mt-xs"
                          rounded
                        />
                      </div>
                      <q-icon 
                        v-if="expandedSavingId === entry.id"
                        name="edit" 
                        size="sm" 
                        color="primary" 
                        style="margin-left: 12px;" 
                        clickable
                      />
                    </div>
                  </q-item-section>

                  <q-item-section side class="text-weight-bold text-positive">
                    {{ formatCurrency(entry.currentMonthAmountChange, entry.currency) }}
                  </q-item-section>
                </q-item>

                <!-- Smooth Sliding Contributions List -->
                <q-slide-transition>
                  <div v-if="expandedSavingId === entry.id">
                    <q-item style="margin-left: 5px;max-width: 80px;" >
                      <q-item-section style="margin-bottom: 8px;">
                        <q-icon name="subdirectory_arrow_right" size="sm"/>
                      </q-item-section>
                      <q-item-section style="margin-left: -25px;">
                        <q-item-label header>Contributions</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-list dense>
                      <q-item v-for="contribution in getCurrentMonthContributionsByGoalId(entry.id)" :key="contribution.id" 
                        style="margin-left: 35px;"> 
                        <q-item-section>
                          <q-item-label>
                            {{ formatCurrency(contribution.amount, contribution.currency) }} 
                            <span class="text-grey-7">({{ formatDate(contribution.contributionDate) }})</span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="!isAnyGoalContribution(entry.id)" style="margin-left: 33px;">
                        <q-item-section>No contributions yet.</q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </q-slide-transition>
              </template>
            </q-list>
            <q-list bordered separator v-else-if="!loadingSavings">
              <q-item v-for="(entry, idx) in displayedSavings" :key="idx">
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ monthNames[idx] }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top class="text-weight-bold text-positive">
                  <q-item-label>{{ formatCurrency(getAmount(entry), 'PLN') }}</q-item-label>
                  <q-item-label class="text-grey-6"><q-icon name="account_balance" style="margin-bottom: 2px;"/>
                    {{ formatCurrency(getSavingsMonthBalance(selectedYear, idx), 'PLN', true) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div class="q-pa-xs row justify-center items-center q-gutter-sm column" v-if="loadingSavings">
              <q-spinner
                color="primary"
                size="3em"
                :thickness="2"
              />
              <span class="q-mt-xs">{{ t('loadingSavings') }}</span>
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
import { useThemeStore } from 'src/stores/themeStore';
import { useLangStore } from "src/stores/langStore"
import { storeToRefs } from 'pinia'
const expensesStore = useExpensesStore()
const { entries: expenses } = storeToRefs(expensesStore)

const incomesStore = useIncomesStore()
const { entries: incomes } = storeToRefs(incomesStore)

const savingsStore = useSavingsStore()
const { entries: savings } = storeToRefs(savingsStore)

const balancesStore = useBalancesStore()
const { balanceDict, savingsBalanceDict, hasInitialized, reloadIncomeExpensesDictionary } = storeToRefs(balancesStore)

const { t } = useLangStore();

const themeStore = useThemeStore();
const { isDarkMode } = storeToRefs(themeStore);

const viewMode = ref("yearly")

const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())

const monthNames = computed(() => [
  t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
  t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
]);

const getTitle = computed(() => (entry) => {
  return entry.title === "No goal" ? t('noGoal') : entry.title;
});

let loadingExpenses = ref(false)
let loadingIncomes = ref(false)
let loadingSavings = ref(false)
onMounted(async () => {
  if (!hasInitialized.value) {
    loadingExpenses.value = true
    loadingIncomes.value = true
    loadingSavings.value = true
    await balancesStore.fetchBalances()
    await expensesStore.fetchExpenses()
    await incomesStore.fetchIncomes()
    await savingsStore.fetchSavingGoals()
    balancesStore.createIncomeExpensesBalanceDictionary(expenses.value, incomes.value, savings.value)
    balancesStore.createSavingsBalanceDictionary(savings.value)
    extendSavingGoalModel()
    loadingExpenses.value = false
    loadingIncomes.value = false
    loadingSavings.value = false
  } else if (reloadIncomeExpensesDictionary.value) {
    balancesStore.createIncomeExpensesBalanceDictionary(expenses.value, incomes.value, savings.value)
    balancesStore.createSavingsBalanceDictionary(savings.value)
  }
})

const currentMonthName = computed(() => monthNames.value[selectedMonth.value])

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

// Yearly View Computation
const yearlyExpenseSummary = (data) => {
  const summary = Array(12).fill(0)
  data.value
    .filter(entry => {
        const entryDate = new Date(entry.paymentDate)
        const isYearMatch = entryDate.getFullYear() === selectedYear.value
      
        return isYearMatch;
      })
    .forEach(entry => {
      const month = new Date(entry.paymentDate).getMonth()
      summary[month] += entry.amount
    })
  return summary
}

const yearlyIncomesSummary = (data) => {
  const summary = Array(12).fill(0)
  data.value
    .filter(entry => {
      const entryDate = new Date(entry.incomeDate)
      const isYearMatch = entryDate.getFullYear() === selectedYear.value
    
      return isYearMatch;
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
function editBalance() {
  isEditingBalance.value = true
}

function saveBalance() {
  isEditingBalance.value = false
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
</script>
