<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 400px">
      <q-card-section class="row justify-between items-center">
        <div class="text-h6">{{ isNewLimit ? 'New Expense Limit' : 'Edit Expense Limit' }}</div>
        
        <!-- Currency Dropdown -->
        <q-select
          v-model="localLimit.currency"
          :options="currencyOptions"
          dense
          outlined
          style="min-width: 100px;"
        />
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="localLimit.title" label="Title" outlined dense />
        <q-input 
          v-model.number="localLimit.limit" 
          label="Limit Amount" 
          type="number" 
          outlined 
          dense
          :prefix="getCurrencySymbol(localLimit.currency)" />

        <q-input v-model="localLimit.month" label="Month (e.g., 01 for January)" outlined dense />
        <q-input v-model="localLimit.year" label="Year (e.g., 2025)" outlined dense />

        <!-- Recurrence Frequency Dropdown -->
        <q-select
          v-model="localLimit.recurrenceFrequency"
          :options="recurrenceOptions"
          label="Recurrence"
          outlined
          dense
        />

        <!-- Repeat Count Input (only visible if a recurrence is selected) -->
        <q-input
          v-if="localLimit.recurrenceFrequency !== 'None'"
          v-model.number="localLimit.recurrence"
          label="Repeat Count"
          type="number"
          outlined
          dense
        />

        <q-select
          v-model="categoryTitle"
          :options="categoryTitles"
          label="Category"
          outlined
          dense
        />
      </q-card-section>

      <q-card-actions>
        <q-btn flat label="Cancel" color="grey" @click="closeDialog" />
        <q-space />  <!-- This pushes the next buttons to the right -->
        <q-btn v-if="!isNewLimit" flat label="Delete" color="negative" @click="isWarningDialogOpened = true;"/>
        <q-btn flat label="Save" color="primary" @click="saveChanges" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <WarningDialog v-model="isWarningDialogOpened" @confirm="deleteLimit" />
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useExpensesStore } from 'src/stores/expensesStore';
import { getCurrencySymbol } from 'src/helpers/formatCurrency.js'
import { storeToRefs } from 'pinia';
import WarningDialog from 'src/components/Base/WarningDialog.vue'

const expensesStore = useExpensesStore();
const { categories } = storeToRefs(expensesStore);  // Using Pinia store for categories

const props = defineProps({
  modelValue: Boolean,  // Controls dialog visibility
  limit: Object,
  isNewLimit: Boolean, // Flag to distinguish between new and existing limit
})

const currencyOptions = ["PLN", "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];
const emit = defineEmits(['update:modelValue', 'save'])
const localLimit = ref({ ...props.limit }) // Copy limit for local editing

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const categoryTitles = computed(() => {
  return categories.value.map(cat => cat.title)
})

const categoryTitle = computed({
  get: () => localLimit.value.expenseCategory?.title || null,
  set: (value) => {
    const categoryByName = categories.value
      .find(category => category.title === value)
    if (!localLimit.value.expenseCategory) {
      localLimit.value.expenseCategory = {} // Create if null
    }
    localLimit.value.expenseCategory = categoryByName
    if (!localLimit.value.title) {
      localLimit.value.title = value;
    }
  }
})

// Watch for prop changes and update localLimit
watch(isOpen, (newVal) => {
  if (newVal) {
    const newLimit = props.isNewLimit
      ? { id: uuidv4(), title: '', limit: 0, currency: 'PLN', month: '', year: '', recurrence: 0, recurrenceFrequency: 'None', expenseCategory: null }
      : { ...props.limit }

    localLimit.value = newLimit
    categoryTitle.value = newLimit.expenseCategory?.title || null
  }
})

function closeDialog() {
  emit('update:modelValue', false)
}

function saveChanges() {
  // Convert month and year to integers before saving
  const limitToSave = { ...localLimit.value, month: parseInt(localLimit.value.month), year: parseInt(localLimit.value.year) }
  emit('save', limitToSave) // Send updated limit back
  closeDialog()
}

const recurrenceOptions = [
  'None', 'Monthly', 'Quarterly', 'Yearly'
];

const isWarningDialogOpened = ref(false)
async function deleteLimit() {
    emit('save', null) 
    await expensesStore.removeExpenseLimit(localLimit.value.id)
};
</script>
