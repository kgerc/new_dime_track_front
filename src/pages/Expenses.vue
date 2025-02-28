<template>
  <q-page>
    <!-- Month/Year Filter -->
    <div class="row justify-center items-center q-my-md">
      <q-btn icon="arrow_back" flat @click="prevMonth" />
      <div class="q-mx-md text-h6">
        {{ currentMonthName }} {{ selectedYear }}
      </div>
      <q-btn icon="arrow_forward" flat @click="nextMonth" />
    </div>

    <!-- Expenses List -->
    <div class="q-pa-md">
      <q-list bordered separator>
        <q-slide-item
          v-for="entry in filteredEntries"
          :key="entry.id"
          right-color="negative"
        >
          <template v-slot:right>
            <q-icon name="delete" @click="removeEntry(entry.id)" />
          </template>
          <q-item>
            <q-item-section class="text-weight-bold" :class="amountColor(entry.amount)">
              {{ entry.name }}
              <div class="text-grey-5 text-caption">
                {{ new Date(entry.date).toLocaleDateString() }}
              </div>
            </q-item-section>
            <q-item-section side class="text-weight-bold" :class="amountColor(entry.amount)">
              {{ formatCurrency(entry.amount) }}
            </q-item-section>
          </q-item>
        </q-slide-item>
      </q-list>
    </div>

    <!-- Footer: Balance & Add New Expense -->
    <q-footer class="bg-transparent">
      <div class="row q-mb-sm q-px-md q-py-sm shadow-up-3">
        <div class="col text-grey-7 text-h6">Balance</div>
        <div class="col text-h6 text-right" :class="amountColor(totalBalance)">
          {{ formatCurrency(totalBalance) }}
        </div>
      </div>

      <q-form @submit.prevent="addEntry" class="row q-px-sm q-pb-sm q-col-gutter-sm bg-primary">
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

const expensesStore = useExpensesStore()
const { entries, totalBalance } = storeToRefs(expensesStore)

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())
const currentMonthName = computed(() => months[selectedMonth.value])

onMounted(() => {
  expensesStore.fetchExpenses()
})

const filteredEntries = computed(() => {
  return entries.value.filter(entry => {
    const d = new Date(entry.date)
    return d.getMonth() === selectedMonth.value && d.getFullYear() === selectedYear.value
  })
})

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

const addEntryForm = reactive({ name: '', amount: null })

function addEntry() {
  if (!addEntryForm.name || addEntryForm.amount === null) return
  expensesStore.addExpense({
    name: addEntryForm.name,
    amount: addEntryForm.amount,
    date: new Date().toISOString().substring(0, 10)
  })
  addEntryForm.name = ''
  addEntryForm.amount = null
}

function removeEntry(id) {
  expensesStore.removeExpense(id)
}
</script>
