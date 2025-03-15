<template>
  <q-page>
    <div class="row justify-between items-center q-my-md q-gutter-sm">
      <div style="width: 24px;"></div>

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
              class="shadow-2 rounded-borders">
                <div class="row items-center justify-between">
                  <q-btn v-close-popup label="Whole month" color="primary" flat :class="{'bg-primary text-white': !selectedDay}" @click="resetToWholeMonth" />
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
        <q-btn icon="arrow_forward" flat @click="nextMonth" />
      </div>

      <q-icon name="sort" size="md" style="margin-right:10px;" color="primary"/>
      <q-icon name="filter_alt" size="md" style="margin-right:25px;" color="primary"/>
    </div>

    <div class="q-pa-md" style="margin-top: -20px;">
      <q-list bordered separator v-if="!loadingIncomes">
        <q-item-label header>Recurring Incomes</q-item-label>
        <q-slide-item v-for="income in filteredRecurrentEntries" :key="income.id" @right="removeIncome(income.id)" right-color="negative">
          <template v-slot:right>
            <q-icon name="delete" />
          </template>
          <q-item clickable @click="openDialog(income)">
            <q-item-section>
              <div class="row items-center">
                <q-icon name="autorenew" class="q-mr-sm" size="sm" color="positive" style="margin-top: -5px;"/>
                <div>
                  <q-item-label class="text-weight-bold">{{ income.title }}</q-item-label>
                  <q-item-label caption style="margin-top: -5px;">{{ format(new Date(income.incomeDate), 'dd.MM.yyyy') }}
                    <q-chip 
                      label="No Category" 
                      text-color="white"
                      style="{ backgroundColor: '#fffff'}" 
                      size='sm'
                    >
                    </q-chip>
                  </q-item-label>
                </div>
              </div>
            </q-item-section>
            <q-item-section side class="text-weight-bold text-positive">
              {{ formatCurrency(income.amount) }}
            </q-item-section>
          </q-item>
        </q-slide-item>

        <q-item-label header>Non-Recurring Incomes</q-item-label>
        <q-slide-item v-for="income in filteredNonRecurrentEntries" :key="income.id" @right="removeIncome(income.id)" right-color="negative">
          <template v-slot:right>
            <q-icon name="delete" />
          </template>
          <q-item clickable @click="openDialog(income)">
            <q-item-section>
              <div class="row items-center">
                <q-icon name="attach_money" class="q-mr-sm" size="sm" color="positive" style="margin-top: -5px;"/>
                <div>
                  <q-item-label class="text-weight-bold">{{ income.title }}</q-item-label>
                  <q-item-label caption style="margin-top: -5px;">{{ format(new Date(income.incomeDate), 'dd.MM.yyyy') }}
                    <q-chip 
                      label="No Category" 
                      text-color="white"
                      style="{ backgroundColor: '#fffff'}" 
                      size='sm'
                    >
                    </q-chip>
                  </q-item-label>
                </div>
              </div>
            </q-item-section>
            <q-item-section side class="text-weight-bold text-positive">
              {{ formatCurrency(income.amount) }}
            </q-item-section>
          </q-item>
        </q-slide-item>
      </q-list>
    </div>

    <!-- Footer: Balance & Add New Expense -->
    <q-footer class="bg-white">
      <div class="q-pa-xs flex flex-center">
        <q-pagination
          v-if="currentMonthEntries.length > 0"
          v-model="currentPage"
          :max="maxPage"
          input
        />
      </div>
      <div class="row q-mb-sm q-px-md q-py-sm shadow-up-3">
        <div class="col text-grey-7 text-h6">Balance</div>
        <div class="col text-h6 text-right" :class="amountColor(totalBalance)">
          {{ formatCurrency(totalBalance) }}
        </div>
      </div>

      <q-form class="row q-px-sm q-pb-sm q-col-gutter-sm bg-primary">
        <div class="row items-center q-pr-md">
          <q-btn icon="add" label="New Income" color="white" flat  class="q-mr-sm" @click="openNewIncomeDialog"/>
          <q-btn icon="add_box" label="New Category" color="white" flat class="q-mr-sm" @click="isCategoryDialogOpen = true"/>
          <q-btn icon="category" :label="`Categories (3)`" color="white" flat class="q-mr-sm" />
        </div>
        <div class="col">
          <q-input v-model="searchQuery" outlined dense bg-color="white" placeholder="Search expenses" class="q-mb-sm"></q-input>
        </div>
      </q-form>
    </q-footer>
    <div class="q-pa-xs row justify-center items-center q-gutter-sm column" v-if="loadingIncomes">
      <q-spinner
        color="primary"
        size="3em"
        :thickness="2"
      />
      <span class="q-mt-xs">Loading incomes...</span>
    </div>
    <IncomeDialog
      v-model="isDialogOpen"
      :income="selectedIncome"
      :isNewIncome="isNewIncome"
      @save="handleIncomeSave"
    />
    <IncomeCategoryDialog 
      v-model="isCategoryDialogOpen" 
      @save="addCategory" 
      :isNewCategory="true"/>
  </q-page>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar'
import { format } from 'date-fns';
import { storeToRefs } from 'pinia'
import { useIncomesStore } from 'src/stores/incomesStore'
import { amountColor } from 'src/helpers/amountColor.js'
import IncomeDialog from 'src/components/Incomes/IncomeDialog.vue'
import IncomeCategoryDialog from 'src/components/Incomes/IncomeCategoryDialog.vue'

const $q = useQuasar()
const currentPage = ref(1)
const incomesStore = useIncomesStore()
const { entries } = storeToRefs(incomesStore)
const  totalBalance = 12000

// Date management
const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()
const selectedDay = ref(null)    // For day filtering
const selectedDate = ref(null);
const selectedYear = ref(currentYear);
const selectedMonth = ref(currentMonth);
const searchQuery = ref('')
const isCalendarOpen = ref(false)
// Expense Editing
const isDialogOpen = ref(false)
const selectedIncome = ref(null)
let loadingIncomes = ref(false)
const itemsPerPage = 10  // Number of entries per page
const currentPageRecurringIncomesAmount = ref(0)
const isNewIncome = ref(false)
const isCategoryDialogOpen = ref(false)
/* 🗓️ Date and Calendar Handling */
const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
]

const currentMonthName = computed(() =>
  format(new Date(selectedYear.value, selectedMonth.value), 'MMMM')
);

const currentMonthEntries = computed(() => {
  return entries.value.filter(entry => {
    const entryDate = new Date(entry.incomeDate)
    const isMonthYearMatch = entryDate.getMonth() === selectedMonth.value &&
     entryDate.getFullYear() === selectedYear.value
    const isDayMatch = selectedDay.value == null || 
      (entryDate.getMonth() === selectedMonth.value && 
      entryDate.getFullYear() === selectedYear.value &&
      entryDate.getDate() === selectedDay.value)
    return isMonthYearMatch && isDayMatch;
  })
})

const filteredRecurrentEntries = computed(() => {
  const recurringEntries = currentMonthEntries.value
  .filter(el => el.isReccuring)
  .sort((a, b) => new Date(b.incomeDate) - new Date(a.incomeDate))
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  currentPageRecurringIncomesAmount.value = filteredRecurrentEntries.value?.length
  return recurringEntries.slice(startIndex, endIndex)
})

const filteredNonRecurrentEntries = computed(() => {
  const nonRecurringEntries = currentMonthEntries.value
  .filter(el => !el.isReccuring)
  .sort((a, b) => new Date(b.incomeDate) - new Date(a.incomeDate))
  const startIndex = (currentPage.value - 1) * itemsPerPage - 
    (currentPage.value > 1 ? currentPageRecurringIncomesAmount.value : 0)
  const endIndex = startIndex + itemsPerPage - 
    (currentPage.value > 1 ? currentPageRecurringIncomesAmount.value : 0)
  return nonRecurringEntries.slice(startIndex, endIndex)
})

// Max page calculation
const maxPage = computed(() => {
  return Math.ceil(currentMonthEntries.value.length / itemsPerPage)
})

// Fetch incomes on mount
onMounted(async () => {
  loadingIncomes.value = true
  await incomesStore.fetchIncomes()
  loadingIncomes.value = false
})

function prevMonth() {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11;
    selectedYear.value--;
  } else {
    selectedMonth.value--;
  }
}

function nextMonth() {
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0;
    selectedYear.value++;
  } else {
    selectedMonth.value++;
  }
}

function updateMonthYear(date) {
  const newDate = new Date(date);
  selectedYear.value = newDate.getFullYear();
  selectedMonth.value = newDate.getMonth();
  selectedDay.value = newDate.getDate();
  isCalendarOpen.value = false;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function removeIncome(id) {
  incomesStore.removeIncome(id)
  // Toast notification for removing an expense
  $q.notify({
    message: 'Income deleted successfully!',
    color: 'negative',
    position: 'top-right',
    timeout: 2000
  })
}

function openDialog(income) {
  selectedIncome.value = { ...income }  // Copy to avoid direct mutation
  isNewIncome.value = false
  isDialogOpen.value = true
}

function toggleCalendar() {
  isCalendarOpen.value = !isCalendarOpen.value
}

function openNewIncomeDialog() {
  selectedIncome.value = null  // Clear previous data
  isNewIncome.value = true
  isDialogOpen.value = true
}

function resetToWholeMonth() {
  selectedDay.value = null // Reset to no day filter (whole month)
  selectedDate.value = null // Reset to no day filter (whole month)
  isCalendarOpen.value = false
}

async function handleIncomeSave(income) {
  if (isNewIncome.value) {
    await handleNewIncome(income)
  } else {
    await handleUpdateIncome(income)
  }
  isDialogOpen.value = false  // Close dialog after saving
}

async function handleNewIncome(income) {
  await incomesStore.addIncome(income)  
  if (income.recurrenceFrequency !== 'None') {
    await incomesStore.fetchIncomes() 
  }
  $q.notify({
    message: 'Income added successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

async function handleUpdateIncome(updatedIncome) {
  await incomesStore.updateIncome(updatedIncome)  // Call store action to update API and local store
}

async function addCategory(newCategory) {
  //await incomesStore.addExpenseCategory(newCategory)
  isCategoryDialogOpen.value = false  // Close dialog after saving
}
</script>
