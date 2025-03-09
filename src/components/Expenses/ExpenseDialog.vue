<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 400px">
      <q-card-section>
        <div class="text-h6">{{ isNewExpense ? 'New Expense' : 'Edit Expense' }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="localExpense.title" label="Title" outlined dense />
        <q-input v-model="localExpense.notes" label="Notes" outlined dense />
        <q-input v-model.number="localExpense.amount" label="Amount" type="number" outlined dense />

        <!-- Recurrence Frequency Dropdown -->
        <q-select
          v-if="isNewExpense"
          v-model="localExpense.recurrenceFrequency"
          :options="recurrenceOptions"
          label="Recurrence"
          outlined
          dense
        />

        <!-- Repeat Count Input (only visible if a recurrence is selected) -->
        <q-input
          v-if="localExpense.recurrenceFrequency !== 'None'"
          v-model.number="localExpense.recurrence"
          label="Repeat Count"
          type="number"
          outlined
          dense
        />
        <q-input v-model="localExpense.paymentDate" label="Payment Date" type="date" outlined dense />

        <q-toggle v-model="localExpense.isPaid" label="Paid?" />

        <q-select
          v-model="categoryTitle"
          :options="categoryTitles"
          label="Category"
          outlined
          dense
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" @click="closeDialog" />
        <q-btn flat label="Save" color="primary" @click="saveChanges" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useExpensesStore } from 'src/stores/expensesStore';
import { storeToRefs } from 'pinia';

const expensesStore = useExpensesStore();
const { categories } = storeToRefs(expensesStore);  // Using Pinia store for categories

const props = defineProps({
  modelValue: Boolean,  // Controls dialog visibility
  expense: Object,
  isNewExpense: Boolean, // Flag to distinguish between new and existing expense
});

const emit = defineEmits(['update:modelValue', 'save']);

const localExpense = ref({ ...props.expense });  // Local copy for editing

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Get category titles from Pinia store
const categoryTitles = computed(() => {
  return categories.value.map(cat => cat.title);
});

// Bind category title to localExpense
const categoryTitle = computed({
  get: () => localExpense.value.expenseCategory?.title || null,
  set: (value) => {
    const categoryByName = categories.value.find(category => category.title === value);
    if (!localExpense.value.expenseCategory) {
      localExpense.value.expenseCategory = {};  // Create if null
    }
    localExpense.value.expenseCategory = categoryByName;
  },
});

// Watch for dialog open and reset localExpense accordingly
watch(isOpen, (newVal) => {
  if (newVal) {
    const newExpense = props.isNewExpense
      ? { id: uuidv4(), title: '', notes: '', amount: 0, recurrence: 0, recurrenceFrequency: 'None', paymentDate: '', isPaid: false, expenseCategory: null }
      : { ...props.expense, paymentDate: format(new Date(props.expense.paymentDate), 'yyyy-MM-dd') };

    localExpense.value = newExpense;
    categoryTitle.value = newExpense.expenseCategory?.title || null;
  }
});

function closeDialog() {
  emit('update:modelValue', false);
}

function saveChanges() {
  emit('save', localExpense.value);  // Send updated expense back
  closeDialog();
}

const recurrenceOptions = ['None', 'Monthly', 'Quarterly', 'Yearly'];
</script>
