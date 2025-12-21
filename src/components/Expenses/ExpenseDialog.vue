<template>
<q-dialog v-model="isOpen" class="modern-dialog">
  <q-card class="dialog-card">
    <!-- Header -->
    <q-card-section class="dialog-header">
      <div class="header-content">
        <h6>{{ isNewExpense ? t('newExpense') : t('editExpense') }}</h6>
        <q-select
          v-model="localExpense.currency"
          :options="currencyOptions"
          dense
          outlined
          class="currency-select"
        />
      </div>
    </q-card-section>

    <q-separator />

    <!-- Content -->
    <q-card-section class="dialog-content">
      <div class="form-field">
        <label>{{ t('title') }}</label>
        <q-input v-model="localExpense.title" outlined dense />
      </div>

      <div class="form-field">
        <label>{{ t('notes') }}</label>
        <q-input v-model="localExpense.notes" outlined dense type="textarea" rows="2" />
      </div>

      <div class="form-field">
        <label>{{ t('amount') }}</label>
        <q-input
          v-model.number="localExpense.amount"
          type="number"
          outlined
          dense
          :prefix="getCurrencySymbol(localExpense.currency)"
        />
      </div>

      <div class="form-field" v-if="isNewExpense">
        <label>{{ t('recurrence') }}</label>
        <q-select
          v-model="localExpense.recurrenceFrequency"
          :options="recurrenceOptions"
          outlined
          dense
        />
      </div>

      <div class="form-field" v-if="localExpense.recurrenceFrequency !== 'None'">
        <label>{{ t('repeatCount') }}</label>
        <q-input
          v-model.number="localExpense.recurrence"
          type="number"
          outlined
          dense
        />
      </div>

      <div class="form-field">
        <label>{{ t('paymentDate') }}</label>
        <q-input
          outlined
          dense
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
      </div>

      <div class="form-field">
        <label>{{ t('category') }}</label>
        <q-select
          v-model="categoryTitle"
          :options="categoryTitles"
          outlined
          dense
        />
      </div>

      <div class="form-field toggle-field">
        <q-toggle v-model="localExpense.isPaid" :label="t('isPaid')" color="positive" />
      </div>
    </q-card-section>

    <q-separator />

    <!-- Actions -->
    <q-card-actions class="dialog-actions">
      <q-btn
        :label="t('cancel')"
        class="btn-secondary"
        @click="closeDialog"
      />
      <q-space />
      <q-btn
        v-if="!isNewExpense"
        :label="t('moveToSavings')"
        class="btn-tertiary"
        @click="moveExpenseToSavings"
      />
      <q-btn
        :label="t('save')"
        class="btn-primary"
        @click="saveChanges"
      />
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

<style scoped lang="scss">
/* Modern Dialog Styling */
.modern-dialog {
  :deep(.q-dialog__backdrop) {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
  }
}

.dialog-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  max-width: 480px;
  width: 100%;
}

/* Header */
.dialog-header {
  padding: 24px 24px 16px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  h6 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: #263238;
  }

  .currency-select {
    min-width: 100px;
  }
}

/* Content */
.dialog-content {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-field {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #757575;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  :deep(.q-field) {
    .q-field__control {
      border-radius: 8px;
      min-height: 48px;

      &:hover {
        border-color: #BDBDBD;
      }
    }

    &.q-field--focused .q-field__control {
      border-color: #1E88E5;
      box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
    }
  }

  &.toggle-field {
    padding-top: 8px;

    :deep(.q-toggle) {
      font-size: 15px;

      .q-toggle__label {
        color: #263238;
      }
    }
  }
}

/* Actions */
.dialog-actions {
  padding: 16px 24px 24px;
  gap: 12px;
}

.btn-primary {
  background: #1E88E5;
  color: white;
  border-radius: 8px;
  min-width: 100px;
  height: 40px;
  font-weight: 500;
  text-transform: none;
  box-shadow: 0 2px 8px rgba(30, 136, 229, 0.25);

  &:hover {
    background: #1565C0;
    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.35);
  }
}

.btn-secondary {
  background: transparent;
  color: #757575;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  min-width: 100px;
  height: 40px;
  text-transform: none;

  &:hover {
    background: #FAFAFA;
    border-color: #BDBDBD;
  }
}

.btn-tertiary {
  background: transparent;
  color: #26A69A;
  border: 1px solid #26A69A;
  border-radius: 8px;
  min-width: 120px;
  height: 40px;
  text-transform: none;

  &:hover {
    background: rgba(38, 166, 154, 0.08);
  }
}

/* Dark Mode */
body.body--dark {
  .dialog-card {
    background: #1E1E1E;
  }

  .dialog-header h6 {
    color: #FFFFFF;
  }

  .form-field label {
    color: #B0B0B0;
  }

  .form-field.toggle-field :deep(.q-toggle__label) {
    color: #E0E0E0;
  }

  .btn-secondary {
    color: #B0B0B0;
    border-color: #3A3A3A;

    &:hover {
      background: #2C2C2C;
      border-color: #4A4A4A;
    }
  }

  :deep(.q-field__control) {
    background: #2C2C2C;
    border-color: #3A3A3A;

    &:hover {
      border-color: #4A4A4A;
    }
  }

  :deep(.q-field--focused .q-field__control) {
    border-color: #1E88E5;
    background: #252525;
  }
}
</style>
