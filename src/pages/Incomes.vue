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
                  <q-btn v-close-popup :label="t('wholeMonth')" color="primary" flat :class="{'bg-primary text-white': !selectedDay}" @click="resetToWholeMonth" />
                  <q-btn v-close-popup :label="t('close')" color="primary" flat />
                </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
        <q-btn icon="arrow_forward" flat @click="nextMonth" />
      </div>
      <q-btn
        flat
        icon="account_balance"
        color="primary"
        @click="toggleCountNotReceivedIncomes"
        :class="countNotReceivedIncomes ? 'bg-grey-9' : ''"
      >
      <q-tooltip class="text-body2">
        {{ t('show balance after all incomes are received') }}
      </q-tooltip>
      </q-btn>
      <q-icon name="sort" size="sm" style="margin-right:10px;" color="primary"/>
      <q-icon name="filter_alt" size="sm" style="margin-right:25px;" color="primary"/>
    </div>

    <div class="row q-col-gutter-lg" style="margin-top: -20px;margin-left: 2px;">
      <div class="col">
        <q-list bordered separator v-if="!loadingIncomes">
          <q-item-label header v-if="filteredRecurrentEntries.length > 0">{{ t('recurringIncomes') }}</q-item-label>
          <q-slide-item v-for="income in filteredRecurrentEntries" :key="income.id" @right="removeIncome(income.id)" right-color="negative">
            <template v-slot:right>
              <q-icon name="delete" />
            </template>
            <q-item clickable @click="openDialog(income)">
              <q-item-section>
                <div class="row items-center">
                  <q-icon
                    :name="getIncomeIcon(income)"
                    class="q-mr-sm"
                    size="sm"
                    :color="getIncomeColor(income)"
                    style="margin-top: -5px;"/>
                  <div>
                    <q-item-label class="text-weight-bold">{{ income.title }}</q-item-label>
                    <q-item-label caption style="margin-top: -5px;">
                      {{ format(new Date(income.incomeDate), 'dd.MM.yyyy') }}
                      <q-chip
                        :label="t('noCategory')"
                        text-color="white"
                        style="{ backgroundColor: '#fffff'}"
                        size="sm"
                      />
                    </q-item-label>
                  </div>
                </div>
              </q-item-section>
              <q-item-section side class="text-weight-bold text-positive">
                {{ formatCurrency(income.amount, income.currency) }}
              </q-item-section>
            </q-item>
          </q-slide-item>

          <q-item-label header v-if="filteredNonRecurrentEntries.length > 0">{{ t('nonRecurringIncomes') }}</q-item-label>
          <q-slide-item v-for="income in filteredNonRecurrentEntries" :key="income.id" @right="removeIncome(income.id)" right-color="negative">
            <template v-slot:right>
              <q-icon name="delete" />
            </template>
            <q-item clickable @click="openDialog(income)">
              <q-item-section>
                <div class="row items-center">
                  <q-icon
                    :name="getIncomeIcon(income)"
                    class="q-mr-sm"
                    size="sm"
                    :color="getIncomeColor(income)"
                    style="margin-top: -5px;"/>
                  <div>
                    <q-item-label class="text-weight-bold">{{ income.title }}</q-item-label>
                    <q-item-label caption style="margin-top: -5px;">
                      {{ format(new Date(income.incomeDate), 'dd.MM.yyyy') }}
                      <q-chip
                        :label="t('noCategory')"
                        text-color="white"
                        style="{ backgroundColor: '#fffff'}"
                        size="sm"
                      />
                    </q-item-label>
                  </div>
                </div>
              </q-item-section>
              <q-item-section side class="q-mr-xs">
                <q-icon
                  v-if="income.notes"
                  name="description"
                  size="sm"
                  class="cursor-pointer"
                  color="grey-6"
                >
                  <q-tooltip v-if="income.notes" anchor="top middle" self="bottom middle">
                    <div class="text-caption">{{ income.notes }}</div>
                  </q-tooltip>
                </q-icon>
              </q-item-section>
              <q-item-section side class="text-weight-bold text-positive fixed-width">
                {{ formatCurrency(income.amount, income.currency) }}
              </q-item-section>
            </q-item>
          </q-slide-item>
        </q-list>
      </div>
      <div class="col-shrink" style="width:500px;">
        <SavingsList :selectedYear="selectedYear" :selectedMonth="selectedMonth"/>
      </div>
    </div>
    <div v-if="currentMonthEntries.length === 0 && !loadingIncomes" class="q-pa-md flex flex-center column" style="margin-right: 80px;">
      <q-icon name="account_balance_wallet" size="4em" color="grey-6" />
      <div class="text-h6 text-grey-6 q-mt-md">{{ t('noIncomes') }}</div>
    </div>

    <q-footer :class="footerClasses">
      <div :class="isDarkMode ? 'q-pa-xs flex flex-center pagination-dark' : 'q-pa-xs flex flex-center'">
        <q-pagination
          v-if="currentMonthEntries.length > 0"
          v-model="currentPage"
          :max="maxPage"
          input
        />
      </div>
      <div :class="isDarkMode ? 'row q-mb-sm q-px-md q-py-sm thin-border' : 'row q-mb-sm q-px-md q-py-sm shadow-up-3'">
        <div class="col" :class="titleClasses">{{ t('incomesSum') }}</div>
        <div class="col text-h6 text-right" :class="amountColor(totalBalance)">
          {{ formatCurrency(totalBalance, 'PLN') }}
        </div>
      </div>

      <q-form class="row q-px-sm q-pb-sm q-col-gutter-sm bg-primary justify-between" :class="formClasses" style="margin-left: -1px;">
        <div class="row items-center q-pr-md">
          <q-btn icon="add" :label="t('newIncome')" color="white" flat class="q-mr-sm" @click="openNewIncomeDialog"/>
          <q-btn icon="add_box" :label="t('newCategory')" color="white" flat class="q-mr-sm" @click="isCategoryDialogOpen = true"/>
          <q-btn icon="category" :label="`${t('categories')} (${incomeCategoriesCount})`" color="white" flat class="q-mr-sm" @click="isCategoriesListDialogOpen = true"/>
        </div>
        <div class="row items-center justify-end col-auto" style="margin-bottom: -5px;">
          <q-input
            v-model="searchQuery"
            outlined
            dense
            :class="searchClasses"
            style="width: 400px;"
            :placeholder="t('searchIncomes')"
            class="q-mb-sm"
          />
        </div>
      </q-form>
    </q-footer>

    <div class="q-pa-xs row justify-center items-center q-gutter-sm column" v-if="loadingIncomes">
      <q-spinner color="primary" size="3em" :thickness="2" />
      <span class="q-mt-xs">{{ t('loadingIncomes') }}</span>
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
      :isNewCategory="true"
    />
    <IncomeCategoriesDialog
      v-model="isCategoriesListDialogOpen"
      @isCategoryEdited="refetchIncomes"
    />
  </q-page>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar'
import { format } from 'date-fns';
import { storeToRefs } from 'pinia'
import { useIncomesStore } from 'src/stores/incomesStore'
import { useThemeStore } from 'src/stores/themeStore';
import { useLangStore } from "src/stores/langStore"
import { amountColor } from 'src/helpers/amountColor.js'
import { formatCurrency } from 'src/helpers/formatCurrency.js'
import { getIncomeIcon, getIncomeColor } from 'src/helpers/incomeUtils.js'
import IncomeDialog from 'src/components/Incomes/IncomeDialog.vue'
import IncomeCategoryDialog from 'src/components/Incomes/IncomeCategoryDialog.vue'
import IncomeCategoriesDialog from 'src/components/Incomes/IncomeCategoriesDialog.vue'
import SavingsList from 'src/components/Savings/SavingsList.vue'

const $q = useQuasar()
const currentPage = ref(1)
const incomesStore = useIncomesStore()
const { entries, categories } = storeToRefs(incomesStore)
const themeStore = useThemeStore();
const { isDarkMode } = storeToRefs(themeStore);
const { t } = useLangStore();

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
const isNewIncome = ref(false)
const isCategoryDialogOpen = ref(false)
const isCategoriesListDialogOpen = ref(false)

const incomeCategoriesCount = computed(() => categories.value.length);

const currentMonthName = computed(() =>
  format(new Date(selectedYear.value, selectedMonth.value), 'MMMM')
);

const currentMonthEntries = computed(() => {
  currentPage.value = 1
  return entries.value.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.value.toLowerCase())

    const entryDate = new Date(entry.incomeDate)

    const isMonthYearMatch = entryDate.getMonth() === selectedMonth.value &&
     entryDate.getFullYear() === selectedYear.value

    const isDayMatch = selectedDay.value == null ||
      (entryDate.getMonth() === selectedMonth.value &&
      entryDate.getFullYear() === selectedYear.value &&
      entryDate.getDate() === selectedDay.value)

    return matchesSearch && isMonthYearMatch && isDayMatch;
  })
})

const countNotReceivedIncomes = ref(false);
function toggleCountNotReceivedIncomes() {
  countNotReceivedIncomes.value = !countNotReceivedIncomes.value
}
const totalBalance = computed(() => {
  return currentMonthEntries.value
    .filter(expense => countNotReceivedIncomes.value || expense.isReceived)
    .reduce((acc, { amount }) => acc + amount, 0)
})

const recurringEntriesFromPrecedingPageCount = computed(() => {
  const recurringEntries = currentMonthEntries.value
  .filter(el => el.isReccuring)
  .sort((a, b) => new Date(b.incomeDate) - new Date(a.incomeDate))
  if (currentPage.value === 1) return 0;

  const startIndex = (currentPage.value - 2) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return recurringEntries.slice(startIndex, endIndex).length
})

const filteredRecurrentEntries = computed(() => {
  const recurringEntries = currentMonthEntries.value
  .filter(el => el.isReccuring)
  .sort((a, b) => new Date(b.incomeDate) - new Date(a.incomeDate))

  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return recurringEntries.slice(startIndex, endIndex)
})

const filteredNonRecurrentEntries = computed(() => {
  const nonRecurringEntries = currentMonthEntries.value
  .filter(el => !el.isReccuring)
  .sort((a, b) => new Date(b.incomeDate) - new Date(a.incomeDate))

  const startIndex = (currentPage.value - 1) * itemsPerPage - recurringEntriesFromPrecedingPageCount.value
  const endIndex = startIndex + itemsPerPage - recurringEntriesFromPrecedingPageCount.value

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
  await incomesStore.fetchIncomeCategories()
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

function removeIncome(id) {
  incomesStore.removeIncome(id)
  $q.notify({
    message: t('incomeDeleted'), // 'Income deleted successfully!'
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
    message: t('incomeAdded'), // 'Income added successfully!'
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

async function handleUpdateIncome(updatedIncome) {
  await incomesStore.updateIncome(updatedIncome)  // Call store action to update API and local store
}

async function addCategory(newCategory) {
  await incomesStore.addIncomeCategory(newCategory)
  isCategoryDialogOpen.value = false
  $q.notify({
    message: t('incomeCategoryAdded'), // 'Income category added successfully!'
    color: 'positive',
    position: 'top-right',
    timeout: 2000
  })
}

async function refetchIncomes(isCategoryEdited) {
  if (isCategoryEdited) await incomesStore.fetchIncomes()
}

const footerClasses = computed(() =>  isDarkMode.value ? 'bg-dark text-white' : 'bg-white text-dark');

// Example: For the title in the summary section
const titleClasses = computed(() => isDarkMode.value ? 'text-white' : 'text-grey-7');

// For the form, switch the background accordingly:
const formClasses = computed(() => isDarkMode.value ? 'bg-grey-9' : 'bg-primary');

const searchClasses = computed(() => isDarkMode.value ? 'bg-grey-9' : 'bg-white');
</script>
