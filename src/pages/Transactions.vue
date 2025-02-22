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

    <div class="q-pa-md">
      <q-list bordered separator>
        <q-slide-item
          v-for="entry in filteredEntries"
          :key="entry.id"
          @right="onEntrySlideRight"
          right-color="negative"
        >
          <template v-slot:right>
            <q-icon name="delete" />
          </template>
          <q-item>
            <q-item-section
              class="text-weight-bold"
              :class="amountColor(entry.amount)"
            >
              <q-item-label>{{ entry.name }}</q-item-label>
              <q-item-label caption>{{ new Date(entry.date).toLocaleDateString() }}</q-item-label>
            </q-item-section>
            <q-item-section
              side
              top
              class="text-weight-bold"
              :class="amountColor(entry.amount)"
            >
              <q-item-label>{{ formatCurrency(entry.amount) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-slide-item>
      </q-list>
    </div>

    <q-footer class="bg-transparent">
      <div class="row q-mb-sm q-px-md q-py-sm shadow-up-3">
        <div class="col text-grey-7 text-h6">Balance</div>
        <div class="col text-h6 text-right" :class="amountColor(balance)">
          {{ formatCurrency(balance) }}
        </div>
      </div>
      <q-form @submit="addEntry" class="row q-px-sm q-pb-sm q-col-gutter-sm bg-primary">
        <div class="col">
          <q-input
            v-model="addEntryForm.name"
            ref="nameForm"
            outlined
            dense
            bg-color="white"
            placeholder="Name"
          />
        </div>
        <div class="col">
          <q-input
            v-model.number="addEntryForm.amount"
            input-class="text-right"
            outlined
            dense
            type="number"
            step="0.01"
            bg-color="white"
            placeholder="Amount"
          />
        </div>
        <div class="col col-auto">
          <q-btn round color="primary" type="submit" icon="add" />
        </div>
      </q-form>
    </q-footer>
  </q-page>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { uid } from 'quasar'
import { formatCurrency } from 'src/helpers/formatCurrency.js'
import { amountColor } from 'src/helpers/amountColor.js'

// Month/Year Filter Logic
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const selectedMonth = ref(new Date().getMonth())
const selectedYear = ref(new Date().getFullYear())
const currentMonthName = computed(() => months[selectedMonth.value])
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

// Transactions entries sample
const entries = ref([
  { id: 'id1', name: 'Transfer from Savings', amount: 1000, date: '2025-01-03' },
  { id: 'id2', name: 'Groceries Payment', amount: -120, date: '2025-01-07' },
  { id: 'id3', name: 'Sold Old Phone', amount: 80, date: '2025-02-10' }
])
const filteredEntries = computed(() => {
  return entries.value.filter(entry => {
    const d = new Date(entry.date)
    return d.getMonth() === selectedMonth.value && d.getFullYear() === selectedYear.value
  })
})
const balance = computed(() => entries.value.reduce((acc, { amount }) => acc + amount, 0))

// Form handling
const nameForm = ref(null)
const addEntryFormDefault = { name: '', amount: null }
const addEntryForm = reactive({ ...addEntryFormDefault })
function addEntryFormReset() {
  Object.assign(addEntryForm, addEntryFormDefault)
  nameForm.value.focus()
}
function addEntry() {
  const newEntry = {
    ...addEntryForm,
    id: uid(),
    date: new Date().toISOString().substring(0, 10)
  }
  entries.value.push(newEntry)
  addEntryFormReset()
}
function onEntrySlideRight(slideItem) {
  const index = entries.value.findIndex(e => e.id === slideItem.key)
  if (index !== -1) {
    entries.value.splice(index, 1)
  }
}
</script>
