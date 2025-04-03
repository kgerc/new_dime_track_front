<template>
  <q-page>
    <div class="row justify-between items-center q-my-md q-gutter-sm">
      <!-- Left-side empty space to balance layout -->
      <div style="width: 24px;"></div>

      <!-- Centered month navigation -->
      <div class="row justify-center items-center col" style="margin-left: 60px;">
        <q-btn icon="arrow_back" flat @click="prevMonth" />

        <q-btn flat @click="toggleCalendar" class="q-mx-md">
          <div class="text-h6" style="min-width: 170px; text-align: center;">
            {{ currentMonthName }} {{ selectedYear }}
          </div>
          <q-popup-proxy cover transition-show="scale" transition-hide="scale" anchor="top middle" :offset="[0, 10]">
            <q-date
              v-model="selectedDate"
              mask="YYYY-MM-DD"
              :default-year="selectedYear"
              :default-month="selectedMonth + 1"
              @update:model-value="updateMonthYear"
              bordered
              minimal
              class="shadow-2 rounded-borders"
            >
              <div class="row items-center justify-between">
                <q-btn
                  v-close-popup
                  label="Whole month"
                  color="primary"
                  flat
                  :class="{'bg-primary text-white': !selectedDay}"
                  @click="resetToWholeMonth"
                />
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>

        <q-btn icon="arrow_forward" flat @click="nextMonth" />
      </div>

      <!-- Right-aligned filter icon -->
      <q-icon name="sort" size="md" style="margin-right:10px;" color="primary"/>
      <q-icon name="filter_alt" size="md" style="margin-right:25px;" color="primary"/>
    </div>

    <!-- Expenses List -->
    <div class="q-pa-md z-0" style="margin-top: -20px;">
        <q-list bordered separator>
          <q-slide-item
            v-for="entry in filteredEntries"
            :key="entry.id"
            @right="removeEntry(entry.id)"
            right-color="negative"
          >
            <template v-slot:right>
              <q-icon name="delete" />
            </template>
            <q-item clickable @click="openDialog(entry)">
              <q-item-section>
                <div class="row items-center">
                  <q-icon
                    :name="getExpenseIcon(entry, currentDate, currentMonth, currentYear)"
                    :color="getExpenseIconColor(entry, currentDate, currentMonth, currentYear)"
                    class="q-mr-sm"
                    size="sm"
                  >
                  <q-tooltip anchor="top middle" self="bottom middle">
                    <div class="text-caption">{{ entry.isPaid ? 'Paid' : 'Unpaid' }}</div>
                  </q-tooltip>
                  </q-icon>
                  <div>
                    <div class="text-weight-bold">{{ entry.title }}</div>
                    <div class="text-grey-5 text-caption">
                      {{ format(new Date(entry.paymentDate), 'dd.MM.yyyy') }}
                      <q-chip 
                      :label="entry.expenseCategory?.title ?? 'No Category'" 
                      text-color="white"
                      :style="{ backgroundColor: entry.expenseCategory?.color }" 
                      size='sm'
                    >
                    </q-chip>
                    </div>
                  </div>
                </div>
              </q-item-section>
              
              <!-- Notes Icon with Tooltip -->
              <q-item-section side class="q-mr-xs">
                <q-icon
                  v-if="entry.notes"
                  name="description"
                  size="sm"
                  class="cursor-pointer"
                  color="grey-6"
                >
                  <q-tooltip v-if="entry.notes" anchor="top middle" self="bottom middle">
                    <div class="text-caption">{{ entry.notes }}</div>
                  </q-tooltip>
                </q-icon>
              </q-item-section>
              <q-item-section side class="text-weight-bold text-negative fixed-width">
                {{ formatCurrency(entry.amount, entry.currency) }}
              </q-item-section>
            </q-item>
          </q-slide-item>
        </q-list>
    </div>
    <div class="q-pa-xs row justify-center items-center q-gutter-sm column" v-if="loadingExpenses">
      <q-spinner
        color="primary"
        size="3em"
        :thickness="2"
      />
      <span class="q-mt-xs">Loading expenses...</span>
    </div>
    <!-- No Expenses Message -->
    <div v-if="filteredEntries.length === 0 && !loadingExpenses" class="q-pa-md flex flex-center column" style="margin-right: 30px;">
      <q-icon name="shopping_cart" size="4em" color="grey-6" />
      <div class="text-h6 text-grey-6 q-mt-md">No expenses this month</div>
    </div>
    <!-- Expense Dialog -->
    <ExpenseDialog
      v-model="isDialogOpen"
      :expense="selectedExpense"
      :isNewExpense="isNewExpense"
      @save="handleExpenseSave"
      @moveExpenseToSavings="handleMoveExpenseToSavings"
    />
    <ExpenseCategoryDialog v-model="isCategoryDialogOpen" @save="addCategory" :isNewCategory="true"/>
    <ExpenseLimitDialog v-model="isLimitDialogOpen" :isNewLimit="true" @save="handleExpenseLimitSave"/>
    <ExpenseLimitsDialog v-model="isLimitsListDialogOpen" :limits="currentMonthLimits" :month-name="`${currentMonthName} ${selectedYear}`"/>
    <ExpenseCategoriesDialog v-model="isCategoriesListDialogOpen" @isCategoryEdited="refetchExpenses" />

    <!-- Footer: Balance & Add New Expense -->
    <q-footer class="bg-white">
      <div class="q-pa-xs flex flex-center">
        <q-pagination
          v-if="filteredEntries.length > 0"
          v-model="currentPage"
          :max="maxPage"
          input
        />
      </div>
      <div class="row q-mb-sm q-px-md q-py-sm shadow-up-3">
        <div class="col text-grey-7 text-h6">Expenses sum</div>
        <div class="col text-h6 text-right" :class="amountColor(totalBalance)">
          {{ formatCurrency(totalBalance, 'PLN') }}
        </div>
      </div>

      <q-form class="row q-px-sm q-pb-sm q-col-gutter-sm bg-primary">
        <div class="row items-center q-pr-md">
          <q-btn icon="add" label="New Expense" color="white" flat @click="openNewExpenseDialog" class="q-mr-sm" />
          <q-btn icon="add_box" label="New Category" color="white" flat @click="isCategoryDialogOpen = true" class="q-mr-sm" />
          <q-btn icon="category" :label="`Categories (${expenseCategoriesCount})`" color="white" flat @click="isCategoriesListDialogOpen = true" class="q-mr-sm" />
          <q-btn icon="assignment_turned_in" label="Assign categories" color="white" flat @click="assignCategories" class="q-mr-sm" />
          <q-btn icon="filter_list" label="Set Expense Limit" color="white" flat @click="isLimitDialogOpen = true" class="q-mr-sm" />
          <q-btn icon="list" :label="`Limits (${expenseLimitsCount})`" color="white" flat @click="isLimitsListDialogOpen = true"  class="q-mr-sm" />
        </div>
        <div class="col">
          <q-input v-model="searchQuery" outlined dense bg-color="white" placeholder="Search expenses" class="q-mb-sm"></q-input>
        </div>
      </q-form>
    </q-footer>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useExpensesStore } from 'src/stores/expensesStore'
import { useSavingsStore } from 'src/stores/savingsStore'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { formatCurrency } from 'src/helpers/formatCurrency.js'
import { amountColor } from 'src/helpers/amountColor.js'
import { getExpenseIcon, getExpenseIconColor, getIncomingUnpaidExpenses } from 'src/helpers/expenseUtils.js'
import { format } from 'date-fns'
import { debounce } from 'lodash';

import ExpenseDialog from 'src/components/Expenses/ExpenseDialog.vue'
import ExpenseCategoryDialog from 'src/components/Expenses/ExpenseCategoryDialog.vue'
import ExpenseCategoriesDialog from 'src/components/Expenses/ExpenseCategoriesDialog.vue'
import ExpenseLimitDialog from 'src/components/Expenses/ExpenseLimitDialog.vue'
import ExpenseLimitsDialog from 'src/components/Expenses/ExpenseLimitsDialog.vue'

/* 🗄️ State Management */
const $q = useQuasar()
const expensesStore = useExpensesStore()
const savingsStore = useSavingsStore()
const { entries, categories, limits } = storeToRefs(expensesStore)

/* 🗓️ Date and Calendar Handling */
const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
]
const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()

const selectedMonth = ref(currentMonth)
const selectedYear = ref(currentYear)
const currentMonthName = computed(() => months[selectedMonth.value])

const selectedDate = ref(null)   // For calendar selection
const selectedDay = ref(null)    // For day filtering
const isCalendarOpen = ref(false)
const isNewExpense = ref(false)
const isCategoriesListDialogOpen = ref(false)


function toggleCalendar() {
  isCalendarOpen.value = !isCalendarOpen.value
}

function updateMonthYear(date) {
  const newDate = new Date(date)
  selectedMonth.value = newDate.getMonth()
  selectedYear.value = newDate.getFullYear()
  selectedDay.value = newDate.getDate() // Optional: keep if you want to filter by day
  isCalendarOpen.value = false  // Close the calendar after selecting
}

function resetToWholeMonth() {
  selectedDay.value = null // Reset to no day filter (whole month)
  selectedDate.value = null // Reset to no day filter (whole month)
  isCalendarOpen.value = false
}

let loadingExpenses = ref(false)
// Fetch expenses on mount
onMounted(async () => {
  loadingExpenses.value = true
  await expensesStore.fetchExpenses()
  loadingExpenses.value = false
  await expensesStore.fetchExpenseCategories()
  await expensesStore.fetchExpenseLimits()
  sumExpensesByCategory();
  checkAndNotifyExceededLimits(); 
  checkAndNotifyUpcomingUnpaidExpenses();
})

function sumExpensesByCategory() {
  categories.value.forEach(cat => {
    const categoryExpenses = entries.value
    .filter(e => {
      const entryDate = new Date(e.paymentDate)
      const isMonthYearMatch = entryDate.getMonth() === selectedMonth.value &&
       entryDate.getFullYear() === selectedYear.value
      return e.expenseCategory && e.expenseCategory.id === cat.id && isMonthYearMatch;
    });
    const expenseLimit = currentMonthLimits.value
    .find(limit => limit.expenseCategory && limit.expenseCategory.id === cat.id)
    if (expenseLimit) {
      expenseLimit.spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0) * -1;
    }
  })
}

watch([selectedMonth, selectedYear], () => {
  sumExpensesByCategory();  // Check whenever month or year changes
});

// Filter entries by selected month, year, and day
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const filteredEntries = computed(() => {
  currentMonthEntries.value.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return currentMonthEntries.value.slice(startIndex, endIndex)
})

const currentMonthLimits = computed(() => {
  return limits.value.filter(limit => {
    const isMonthYearMatch = limit.month - 1 === selectedMonth.value && limit.year === selectedYear.value
    return isMonthYearMatch
  })
})

    // Debounce logic
  const updateDebouncedSearch = debounce((query) => {
    debouncedSearchQuery.value = query;
  }, 300);

  // Watch for changes in searchQuery and update debouncedSearchQuery
  watch(searchQuery, (newQuery) => {
    updateDebouncedSearch(newQuery);
  });

  // Computed property for filtered entries
  const currentMonthEntries = computed(() => {
    return entries.value.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(debouncedSearchQuery.value.toLowerCase());

      const entryDate = new Date(entry.paymentDate);
      const isMonthYearMatch = entryDate.getMonth() === selectedMonth.value && entryDate.getFullYear() === selectedYear.value;
      const isDayMatch = selectedDay.value == null || 
        (entryDate.getMonth() === selectedMonth.value &&
        entryDate.getFullYear() === selectedYear.value &&
        entryDate.getDate() === selectedDay.value);

      return matchesSearch && isMonthYearMatch && isDayMatch;
    });
  });

const totalBalance = computed(() => {
  return currentMonthEntries.value.reduce((acc, { amount }) => acc + amount, 0)
})

// Month navigation
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

// Remove expense
function removeEntry(id) {
  expensesStore.removeExpense(id)
  // Toast notification for removing an expense
  $q.notify({
    message: 'Expense deleted successfully!',
    color: 'negative',
    position: 'top-right',
    timeout: 2000
  })
}

// Expense Editing
const isDialogOpen = ref(false)
const selectedExpense = ref(null)

// Example categories (replace with API call if needed)

function openDialog(expense) {
  selectedExpense.value = { ...expense }  // Copy to avoid direct mutation
  isNewExpense.value = false
  isDialogOpen.value = true
}

async function handleUpdateExpense(updatedExpense) {
  await expensesStore.updateExpense(updatedExpense)  // Call store action to update API and local store
  isDialogOpen.value = false  // Close dialog after saving
}

const isCategoryDialogOpen = ref(false)

// Open new expense dialog
function openNewExpenseDialog() {
  selectedExpense.value = null  // Clear previous data
  isNewExpense.value = true
  isDialogOpen.value = true
}

// Handle saving a new expense
async function handleNewExpense(newExpense) {
  await expensesStore.addExpense(newExpense)  // Call store action to add a new expense
  if (newExpense.recurrenceFrequency !== 'None') {
    await expensesStore.fetchExpenses()  // Refetch expenses if adding was successful
  }
  isDialogOpen.value = false  // Close dialog after saving
  $q.notify({
    message: 'Expense added successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
  // Check for exceeded limits after adding an expense
  checkAndNotifyExceededLimits();
}

async function handleExpenseSave(expense) {
  if (isNewExpense.value) {
    await handleNewExpense(expense)
  } else {
    await handleUpdateExpense(expense)
  }
  isDialogOpen.value = false  // Close dialog after saving
  await expensesStore.fetchExpenseLimits()
  sumExpensesByCategory();
  checkAndNotifyExceededLimits();  // Check whenever expense is edited
}

async function handleMoveExpenseToSavings(id) {
  await expensesStore.moveExpenseToSavings(id)
  await savingsStore.fetchSavingGoals()
  $q.notify({
    message: 'Expense moved to savings successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

async function addCategory(newCategory) {
  await expensesStore.addExpenseCategory(newCategory)
  isCategoryDialogOpen.value = false  // Close dialog after saving
  $q.notify({
    message: 'Expense category added successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

const isLimitDialogOpen = ref(false);
const isLimitsListDialogOpen = ref(false);
const expenseLimitsCount = computed(() => currentMonthLimits.value.length);
const expenseCategoriesCount = computed(() => categories.value.length);


async function handleExpenseLimitSave(expenseLimit) {
  await handleNewExpenseLimit(expenseLimit)
  isLimitDialogOpen.value = false  // Close dialog after saving
  sumExpensesByCategory();
}

// Handle saving a new expense
async function handleNewExpenseLimit(newExpenseLimit) {
  await expensesStore.addExpenseLimit(newExpenseLimit)  // Call store action to add a new expense
  if (newExpenseLimit.recurrenceFrequency !== 'None') {
    await expensesStore.fetchExpenseLimits()  // Refetch expenses if adding was successful
  }
  isLimitDialogOpen.value = false  // Close dialog after saving
  $q.notify({
    message: 'Expense limit added successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

const previousExceededLimits = ref([]);
const previousIncomingExpenses = ref([]);
const exceededLimits = computed(() => {
  // Assuming mockedLimits contains limit, spent, and category information
  return currentMonthLimits.value.filter(limit => limit.spent > limit.limit);
});

watch([selectedMonth, selectedYear], () => {
  checkAndNotifyExceededLimits();  // Check whenever month or year changes
  checkAndNotifyUpcomingUnpaidExpenses();
});

function checkAndNotifyExceededLimits() {
  const newlyExceeded = exceededLimits.value.filter(limit =>
    !previousExceededLimits.value.some(limitId => limitId === limit.id)
  );

  if (newlyExceeded.length > 0) {
    newlyExceeded.forEach(limit => {
      $q.notify({
        message: `You have exceeded your limit for ${limit.expenseCategory.title} in ${currentMonthName.value} ${selectedYear.value} !`,
        color: 'negative',
        icon: 'warning',
        position: 'top-right',
        timeout: 3000
      });
      // Update the list of previously exceeded limits
      previousExceededLimits.value.push(limit.id);
    });

  }
}

function checkAndNotifyUpcomingUnpaidExpenses() {
  const notificationExpenses = getIncomingUnpaidExpenses(currentMonthEntries.value, currentDate)
  const newlyExceeded = notificationExpenses.filter(expense =>
    !previousIncomingExpenses.value.some(expenseId => expenseId === expense.id)
  );

  if (newlyExceeded.length > 0) {
    let expenseList = ""
    newlyExceeded.forEach(expense => {
      expenseList += expense.title + ", "
      // Update the list of previously exceeded limits
      previousIncomingExpenses.value.push(expense.id);
    });
    $q.notify({
        message: `Following expenses are due in 3 days: <br/> ${expenseList}`,
        html: true,
        color: 'negative',
        icon: 'warning',
        position: 'top-right',
        timeout: 3000
      });
  }
}

// Pagination and page control
const currentPage = ref(1)
const itemsPerPage = 10  // Number of entries per page

// Max page calculation
const maxPage = computed(() => {
  return Math.ceil(currentMonthEntries.value.length / itemsPerPage)
})

async function refetchExpenses(isCategoryEdited) {
  if (isCategoryEdited) await expensesStore.fetchExpenses() 
}

async function assignCategories() {
  await expensesStore.assignExpenseCategories()
  await expensesStore.fetchExpenses()
  currentPage.value = 1
  $q.notify({
    message: 'Expense categories assigned successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

</script>
