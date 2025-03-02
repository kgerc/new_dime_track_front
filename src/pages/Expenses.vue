<template>
  <q-page>
    <!-- Month/Year Filter with Border -->
    <div class="row justify-center items-center q-my-md">
      <q-btn icon="arrow_back" flat @click="prevMonth" />
      <q-btn flat @click="toggleCalendar" class="q-mx-md">
        <div class="text-h6">{{ currentMonthName }} {{ selectedYear }}</div>
        <!-- Popup for Date Selection -->
        <q-popup-proxy cover transition-show="scale" transition-hide="scale" anchor="top middle"
          :offset="[0, 10]">
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
              <!-- Highlighted "Whole month" button -->
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

    <!-- Expenses List -->
    <div class="q-pa-md z-0">
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
                  :name="getExpenseIcon(entry)"
                  :color="getExpenseIconColor(entry)"
                  class="q-mr-sm"
                  size="sm"
                />
                <div>
                  <div class="text-weight-bold">{{ entry.title }}</div>
                  <div class="text-grey-5 text-caption">
                    {{ new Date(entry.paymentDate).toLocaleDateString() }}
                  </div>
                </div>
              </div>
            </q-item-section>
            <q-item-section side>
              <span :class="entry.isPaid ? 'text-green' : 'text-red'">
                {{ entry.isPaid ? 'Paid' : 'Unpaid' }}
              </span>
            </q-item-section>
            <q-item-section side class="text-weight-bold">
              {{ formatCurrency(entry.amount) }}
            </q-item-section>
          </q-item>
        </q-slide-item>
      </q-list>
    </div>

    <!-- Expense Dialog -->
    <ExpenseDialog
      v-model="isDialogOpen"
      :expense="selectedExpense"
      :categories="categories"
      :isNewExpense="isNewExpense"
      @save="handleExpenseSave"
    />

    <ExpenseCategoryDialog v-model="isCategoryDialogOpen" @save="addCategory" />
    
    <!-- Footer: Balance & Add New Expense -->
    <q-footer class="bg-transparent">
      <div class="row q-mb-sm q-px-md q-py-sm shadow-up-3">
        <div class="col text-grey-7 text-h6">Balance</div>
        <div class="col text-h6 text-right" :class="amountColor(totalBalance)">
          {{ formatCurrency(totalBalance) }}
        </div>
      </div>

      <q-form @submit.prevent="addEntry" class="row q-px-sm q-pb-sm q-col-gutter-sm bg-primary">
        <div class="row items-center q-pr-md">
          <q-btn icon="category" label="New Category" color="white" flat @click="isCategoryDialogOpen = true" class="q-mr-sm" />
          <q-btn icon="add" label="New Expense" color="white" flat @click="openNewExpenseDialog" class="q-mr-sm" />
        </div>
        <div class="col">
          <q-input v-model="addEntryForm.name" ref="nameForm" outlined dense bg-color="white" placeholder="Name" />
        </div>
        <div class="col">
          <q-input v-model.number="addEntryForm.amount" input-class="text-right" outlined dense type="number" step="0.01" bg-color="white" placeholder="Amount" />
        </div>
        <div class="col col-auto">
          <q-btn round color="primary" type="submit" icon="add" />
        </div>
      </q-form>
    </q-footer>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useExpensesStore } from 'src/stores/expensesStore'
import { storeToRefs } from 'pinia'
import { formatCurrency } from 'src/helpers/formatCurrency.js'
import { amountColor } from 'src/helpers/amountColor.js'
import ExpenseDialog from 'src/components/Expenses/ExpenseDialog.vue'
import ExpenseCategoryDialog from 'src/components/Expenses/ExpenseCategoryDialog.vue'
import { useQuasar  } from 'quasar' 

const $q = useQuasar()
const expensesStore = useExpensesStore()
const { entries, totalBalance, categories } = storeToRefs(expensesStore)

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())
const currentMonthName = computed(() => months[selectedMonth.value])
const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

// Calendar Picker Logic
const selectedDate = ref(null)  // For calendar selection
const selectedDay = ref(null) // For day filtering
const isCalendarOpen = ref(false)
const isNewExpense = ref(false)

function toggleCalendar() {
  isCalendarOpen.value = !isCalendarOpen.value
}

function updateMonthYear(date) {
  const newDate = new Date(date)
  selectedMonth.value = newDate.getMonth()
  selectedYear.value = newDate.getFullYear()
  selectedDay.value = newDate.getDate() // Set day filter to the selected day
  isCalendarOpen.value = false  // Close the calendar after selecting
}

function resetToWholeMonth() {
  selectedDay.value = null // Reset to no day filter (whole month)
  selectedDate.value = null // Reset to no day filter (whole month)
  isCalendarOpen.value = false
}

// Fetch expenses on mount
onMounted(() => {
  expensesStore.fetchExpenses()
  expensesStore.fetchExpenseCategories()
})

// Filter entries by selected month, year, and day
const filteredEntries = computed(() => {
  return entries.value.filter(entry => {
    const entryDate = new Date(entry.paymentDate)
    const isMonthYearMatch = entryDate.getMonth() === selectedMonth.value && entryDate.getFullYear() === selectedYear.value
    const isDayMatch = selectedDay.value ? entryDate.getDate() === selectedDay.value : true
    return isMonthYearMatch && isDayMatch
  })
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

// Add expense
const addEntryForm = reactive({ name: '', amount: null })

function addEntry() {
  if (!addEntryForm.name || addEntryForm.amount === null) return
  expensesStore.addExpense({
    title: addEntryForm.name,
    amount: addEntryForm.amount,
    paymentDate: new Date().toISOString().substring(0, 10)
  })
  // Toast notification for adding an expense
  $q.notify({
    message: 'Expense added successfully!',
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
  addEntryForm.name = ''
  addEntryForm.amount = null
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
}

async function handleExpenseSave(expense) {
  if (isNewExpense.value) {
    await handleNewExpense(expense)
  } else {
    await handleUpdateExpense(expense)
  }
  isDialogOpen.value = false  // Close dialog after saving
}

async function addCategory(newCategory) {
  await expensesStore.addExpenseCategory(newCategory)
  isCategoryDialogOpen.value = false  // Close dialog after saving
}

function getExpenseIcon(entry) {
  if (entry.isPaid) return 'check_circle';  // Paid: Green check
  const entryDate = new Date(entry.paymentDate);

  if (
    entryDate.getFullYear() === currentYear &&
    entryDate.getMonth() === currentMonth &&
    currentDate >= entryDate.setDate(entryDate.getDate() - 3)
  ) {
    return 'warning';  // Unpaid in current month and 3 days before: Red warning
  } else if (entryDate > currentDate) {
    return 'schedule';  // Unpaid in future: Grey schedule
  }
  
  return 'warning';  // Fallback for unpaid past expenses (optional)
}

function getExpenseIconColor(entry) {
  if (entry.isPaid) return 'green';  // Paid: Green
  const entryDate = new Date(entry.paymentDate);
  if (
    entryDate.getFullYear() === currentYear &&
    entryDate.getMonth() === currentMonth &&
    currentDate >= entryDate.setDate(entryDate.getDate() - 3)
  ) {
    return 'red';  // Unpaid in current month and 3 days before: Red
  } else if (entryDate > currentDate) {
    return 'grey';  // Unpaid in future: Grey
  }
  
  return 'red';  // Fallback color for unpaid past expenses (optional)
}

</script>
