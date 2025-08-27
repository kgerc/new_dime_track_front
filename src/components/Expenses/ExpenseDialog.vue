<template>
<q-dialog v-model="isOpen">
  <q-card style="width: 400px">
    <q-card-section class="row justify-between items-center">
      <div class="text-h6">{{ isNewExpense ? t('newExpense') : t('editExpense') }}</div>

      <!-- Currency Dropdown -->
      <q-select
        v-model="localExpense.currency"
        :options="currencyOptions"
        dense
        outlined
        style="min-width: 100px;"
      />
    </q-card-section>

    <q-card-section class="q-gutter-md">
      <q-input v-model="localExpense.title" :label="t('title')" outlined dense />
      <q-input v-model="localExpense.notes" :label="t('notes')" outlined dense />
      <q-input
        v-model.number="localExpense.amount"
        :label="t('amount')"
        type="number"
        outlined
        dense
        :prefix="getCurrencySymbol(localExpense.currency)"
      />
      <q-select
        v-if="isNewExpense"
        v-model="localExpense.recurrenceFrequency"
        :options="recurrenceOptions"
        :label="t('recurrence')"
        outlined
        dense
      />
      <q-input
        v-if="localExpense.recurrenceFrequency !== 'None'"
        v-model.number="localExpense.recurrence"
        :label="t('repeatCount')"
        type="number"
        outlined
        dense
      />
      <q-input
        outlined
        dense
        :label="t('paymentDate')"
        v-model="localExpense.paymentDate"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                v-model="localExpense.paymentDate"
                mask="YYYY-MM-DD"
                :locale="enLocale"
                bordered
                minimal
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-toggle v-model="localExpense.isPaid" :label="t('isPaid')" />

      <q-select
        v-model="categoryTitle"
        :options="categoryTitles"
        :label="t('category')"
        outlined
        dense
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat :label="t('cancel')" color="grey" @click="closeDialog" />
      <q-space />  <!-- This pushes the next buttons to the right -->
      <q-btn v-if="!isNewExpense" flat :label="t('moveToSavings')" color="primary" @click="moveExpenseToSavings" />
      <q-btn flat :label="t('save')" color="blue" @click="saveChanges" />
    </q-card-actions>
  </q-card>
</q-dialog>

</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useExpensesStore } from 'src/stores/expensesStore';
import { useLangStore } from "src/stores/langStore"
import { getCurrencySymbol } from 'src/helpers/formatCurrency.js'
import { storeToRefs } from 'pinia';

const expensesStore = useExpensesStore();
const { categories } = storeToRefs(expensesStore);  // Using Pinia store for categories
const { t } = useLangStore();

const props = defineProps({
  modelValue: Boolean,  // Controls dialog visibility
  expense: Object,
  isNewExpense: Boolean, // Flag to distinguish between new and existing expense
});
const enLocale = {
  days: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
  daysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
  months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
  monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_')
}
const emit = defineEmits(['update:modelValue', 'save', 'moveExpenseToSavings']);
const currencyOptions = ["PLN", "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];
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
      ? { id: uuidv4(), title: '', notes: '', amount: 0, currency: 'USD', recurrence: 0, recurrenceFrequency: 'None', paymentDate: '', isPaid: false, expenseCategory: null }
      : { ...props.expense, paymentDate: format(new Date(props.expense.paymentDate), "yyyy-MM-dd'T00:00:00'") };

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

function moveExpenseToSavings() {
  emit('moveExpenseToSavings', localExpense.value.id);  // Send updated expense back
  closeDialog();
}

const recurrenceOptions = ['None', 'Monthly', 'Quarterly', 'Yearly'];
</script>
