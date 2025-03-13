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
            <q-date v-model="selectedDate" mask="YYYY-MM-DD" :default-year="selectedYear" :default-month="selectedMonth + 1" @update:model-value="updateMonthYear" bordered minimal class="shadow-2 rounded-borders">
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

    <div class="q-pa-md">
      <q-list bordered separator>
        <q-item-label header>Recurrent Incomes</q-item-label>
        <q-slide-item v-for="income in recurrentIncomes" :key="income.id" @right="removeIncome(income.id)" right-color="negative">
          <template v-slot:right>
            <q-icon name="delete" />
          </template>
          <q-item clickable @click="openDialog(income)">
            <q-item-section>
              <div class="row items-center">
                <q-icon name="autorenew" class="q-mr-sm" size="sm" color="positive" />
                <div>
                  <q-item-label class="text-weight-bold">{{ income.title }}</q-item-label>
                  <q-item-label caption>{{ format(new Date(income.date), 'dd.MM.yyyy') }}</q-item-label>
                </div>
              </div>
            </q-item-section>
            <q-item-section side class="text-weight-bold text-positive">
              {{ formatCurrency(income.amount) }}
            </q-item-section>
          </q-item>
        </q-slide-item>

        <q-item-label header>Non-Recurrent Incomes</q-item-label>
        <q-slide-item v-for="income in nonRecurrentIncomes" :key="income.id" @right="removeIncome(income.id)" right-color="negative">
          <template v-slot:right>
            <q-icon name="delete" />
          </template>
          <q-item clickable @click="openDialog(income)">
            <q-item-section>
              <div class="row items-center">
                <q-icon name="attach_money" class="q-mr-sm" size="sm" color="positive" />
                <div>
                  <q-item-label class="text-weight-bold">{{ income.title }}</q-item-label>
                  <q-item-label caption>{{ format(new Date(income.date), 'dd.MM.yyyy') }}</q-item-label>
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
          v-if="recurrentIncomes.length > 0"
          v-model="currentPage"
          :max="4"
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
          <q-btn icon="add" label="New Income" color="white" flat  class="q-mr-sm" />
          <q-btn icon="add_box" label="New Category" color="white" flat class="q-mr-sm" />
          <q-btn icon="category" :label="`Categories (3)`" color="white" flat class="q-mr-sm" />
        </div>
        <div class="col">
          <q-input v-model="searchQuery" outlined dense bg-color="white" placeholder="Search expenses" class="q-mb-sm"></q-input>
        </div>
      </q-form>
    </q-footer>
  </q-page>
</template>


<script setup>
import { ref, computed } from 'vue';
import { format } from 'date-fns';
import { storeToRefs } from 'pinia'
import { useExpensesStore } from 'src/stores/expensesStore'
import { amountColor } from 'src/helpers/amountColor.js'

const currentPage = 1
const expensesStore = useExpensesStore()
const { totalBalance } = storeToRefs(expensesStore)
// Mocked incomes data
const recurrentIncomes = ref([
  { id: 1, title: "Salary", amount: 5000, date: "2025-03-01" },
  { id: 2, title: "Freelance Contract", amount: 1200, date: "2025-03-05" }
]);

const nonRecurrentIncomes = ref([
  { id: 3, title: "Bonus", amount: 600, date: "2025-03-10" },
  { id: 4, title: "Gift", amount: 200, date: "2025-03-15" },
  { id: 5, title: "Gift", amount: 200, date: "2025-03-15" },
  { id: 6, title: "Gift", amount: 200, date: "2025-03-15" },
  { id: 7, title: "Gift", amount: 200, date: "2025-03-15" }
]);

// Date management
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth());

const currentMonthName = computed(() =>
  format(new Date(selectedYear.value, selectedMonth.value), 'MMMM')
);

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
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function removeIncome(id) {
  nonRecurrentIncomes.value = nonRecurrentIncomes.value.filter(income => income.id !== id);
}

function openDialog(income) {
  console.log("Opening dialog for:", income);
}
</script>
