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
        <div class="row items-center justify-end">
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
            <q-item-section class="text-weight-bold" :class="amountColor(entry.amount)">
              {{ entry.title }}
              <div class="text-grey-5 text-caption">
                {{ new Date(entry.paymentDate).toLocaleDateString() }}
              </div>
            </q-item-section>
            <q-item-section side class="text-weight-bold" :class="amountColor(entry.amount)">
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
      @save="handleUpdateExpense"
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

const expensesStore = useExpensesStore()
const { entries, totalBalance, categories } = storeToRefs(expensesStore)

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())
const currentMonthName = computed(() => months[selectedMonth.value])

// Calendar Picker Logic
const selectedDate = ref(new Date().toISOString().substring(0, 10))  // For calendar selection
const isCalendarOpen = ref(false)

function toggleCalendar() {
  isCalendarOpen.value = !isCalendarOpen.value
}

function updateMonthYear(date) {
  const newDate = new Date(date)
  selectedMonth.value = newDate.getMonth()
  selectedYear.value = newDate.getFullYear()
  isCalendarOpen.value = false  // Close the calendar after selecting
}

// Fetch expenses on mount
onMounted(() => {
  expensesStore.fetchExpenses()
  expensesStore.fetchExpenseCategories()
})

// Filter entries by selected month and year
const filteredEntries = computed(() => {
  return entries.value.filter(entry => {
    const d = new Date(entry.paymentDate)
    return d.getMonth() === selectedMonth.value && d.getFullYear() === selectedYear.value
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
  addEntryForm.name = ''
  addEntryForm.amount = null
}

// Remove expense
function removeEntry(id) {
  expensesStore.removeExpense(id)
}

// Expense Editing
const isDialogOpen = ref(false)
const selectedExpense = ref(null)

// Example categories (replace with API call if needed)

function openDialog(expense) {
  selectedExpense.value = { ...expense }  // Copy to avoid direct mutation
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
  isDialogOpen.value = true
}

// Handle saving a new expense
async function handleNewExpense(newExpense) {
  await expensesStore.addExpense(newExpense)  // Call store action to add a new expense
  isDialogOpen.value = false  // Close dialog after saving
}

async function addCategory(newCategory) {
  await expensesStore.addExpenseCategory(newCategory)
  isCategoryDialogOpen.value = false  // Close dialog after saving
}

</script>
