<template>
    <q-dialog v-model="isOpen">
      <q-card style="width: 400px">
        <q-card-section class="row justify-between items-center">
          <div class="text-h6">{{ isNewIncome ? 'New Income' : 'Edit Income' }}</div>
          <!-- Currency Dropdown -->
          <q-select
            v-model="localIncome.currency"
            :options="currencyOptions"
            dense
            outlined
            style="min-width: 100px;"
          />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="localIncome.title" label="Title" outlined dense />
          <q-input v-model="localIncome.notes" label="Notes" outlined dense />
          <q-input
            v-model.number="localIncome.amount"
            label="Amount"
            type="number"
            outlined
            dense
            :prefix="getCurrencySymbol(localIncome.currency)"/>

          <!-- Recurrence Frequency Dropdown -->
          <q-select
            v-if="isNewIncome"
            v-model="localIncome.recurrenceFrequency"
            :options="recurrenceOptions"
            label="Recurrence"
            outlined
            dense
          />

          <!-- Repeat Count Input (only visible if a recurrence is selected) -->
          <q-input
            v-if="localIncome.recurrenceFrequency !== 'None'"
            v-model.number="localIncome.recurrence"
            label="Repeat Count"
            type="number"
            outlined
            dense
          />
          <q-input v-model="localIncome.incomeDate" label="Payment Date" type="date" outlined dense />

          <q-toggle v-model="localIncome.isReceived" label="Received?" />

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
          <q-btn flat label="Save" color="blue" @click="saveChanges" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>

  <script setup>
  import { defineProps, defineEmits, ref, computed, watch } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  import { format } from 'date-fns';
  import { useIncomesStore } from 'src/stores/incomesStore';
  import { storeToRefs } from 'pinia';
  import { getCurrencySymbol } from 'src/helpers/formatCurrency.js'

  const incomesStore = useIncomesStore();
  const { categories } = storeToRefs(incomesStore);  // Using Pinia store for categories

  const props = defineProps({
    modelValue: Boolean,  // Controls dialog visibility
    income: Object,
    isNewIncome: Boolean, // Flag to distinguish between new and existing expense
  });

  const emit = defineEmits(['update:modelValue', 'save']);
  const currencyOptions = ["PLN", "PLN", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];
  const localIncome = ref({ ...props.income });  // Local copy for editing

  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });

  // Get category titles from Pinia store
  const categoryTitles = computed(() => {
    return categories.value.map(cat => cat.title);
  });

  // Bind category title to localIncome
  const categoryTitle = computed({
    get: () => localIncome.value.expenseCategory?.title || null,
    set: (value) => {
      const categoryByName = categories.value.find(category => category.title === value);
      if (!localIncome.value.expenseCategory) {
        localIncome.value.expenseCategory = {};  // Create if null
      }
      localIncome.value.expenseCategory = categoryByName;
    }
  });

  // Watch for dialog open and reset localIncome accordingly
  watch(isOpen, (newVal) => {
    if (newVal) {
      const newIncome = props.isNewIncome
        ? { id: uuidv4(), title: '', notes: '', amount: 0, currency: 'PLN', recurrence: 0, recurrenceFrequency: 'None', incomeDate: '', isReceived: false, expenseCategory: null }
        : { ...props.income, incomeDate: format(new Date(props.income.incomeDate), 'yyyy-MM-dd') };

      localIncome.value = newIncome;
      categoryTitle.value = newIncome.incomeCategory?.title || null;
    }
  });

  function closeDialog() {
    emit('update:modelValue', false);
  }

  function saveChanges() {
    emit('save', localIncome.value);  // Send updated expense back
    closeDialog();
  }

  const recurrenceOptions = ['None', 'Monthly', 'Quarterly', 'Yearly'];
  </script>
