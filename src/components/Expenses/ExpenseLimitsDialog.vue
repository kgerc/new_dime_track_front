<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 400px">
      <!-- Summary Section -->
      <q-card-section class="text-center q-py-sm">
        <div class="text-h6">Expense Limits</div>
        <div class="text-body2">
          Spent: {{ totalSpent }} PLN / Limit: {{ totalLimit }} PLN
        </div>
        <q-linear-progress
          :value="totalSpent / totalLimit"
          :color="totalSpent > totalLimit ? 'red' : 'blue'"
          size="10px"
          rounded
          stripe
        />
      </q-card-section>

      <!-- Limits List with Expandable Items -->
      <q-list bordered>
        <q-expansion-item
          v-for="limit in limits"
          :key="limit.id"
          :label="getLimitCategory(limit)"
          icon="circle"
          expand-separator
          class="custom-expansion-item"
          :style="{ '--icon-color': limit.expenseCategory?.color }"
        >
          <q-item>
            <q-item-section>
              <q-chip>
                Spent: {{ formatCurrency(limit.spent, 'PLN', true) }} / Limit: {{ limit.limit }} PLN
              </q-chip>
              <div
                :class="isLimitExceeded(limit) ? 'text-red' : 'text-green'"
                class="text-caption flex items-center justify-between"
              >
                <div class="flex items-center">
                  <q-icon
                    style="margin-left:10px;"
                    :name="isLimitExceeded(limit) ? 'error' : 'check_circle'"
                    :color="isLimitExceeded(limit) ? 'red' : 'green'"
                    size="sm"
                    class="q-mr-xs"
                  />
                  <span v-if="isLimitExceeded(limit)">
                    Exceeded by {{ getExceededAmount(limit) }} PLN
                  </span>
                  <span v-else>
                    Within limit
                  </span>
                </div>
                <q-btn
                  size="sm"
                  flat
                  icon="edit"
                  color="primary"
                  @click="isLimitDialogOpen = true"
                />
              </div>
            </q-item-section>
          </q-item>
          <ExpenseLimitDialog
            v-model="isLimitDialogOpen"
            :limit="limit"
            :isNewLimit="false"
            @save="handleExpenseLimitSave"/>
        </q-expansion-item>
      </q-list>

      <!-- Action Buttons -->
      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import ExpenseLimitDialog from 'src/components/Expenses/ExpenseLimitDialog.vue';
import { useExpensesStore } from 'src/stores/expensesStore';
import { formatCurrency } from 'src/helpers/formatCurrency.js'

const $q = useQuasar();
const expensesStore = useExpensesStore();

const props = defineProps({
  limits: Array,
  modelValue: Boolean,
  monthName: String,
});

const emit = defineEmits(['update:modelValue']);

const closeDialog = () => {
  emit('update:modelValue', false);
};

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
const isLimitDialogOpen = ref(false);

// Computed properties for totals based on the store data
const totalSpent = computed(() => {
  return props.limits.reduce((sum, limit) => sum + limit.spent, 0).toFixed(2);
});

const totalLimit = computed(() => {
  return props.limits.reduce((sum, limit) => sum + limit.limit, 0).toFixed(2);
});

// Helper methods
const getLimitCategory = (limit) => limit.expenseCategory?.title;

const isLimitExceeded = (limit) => limit.spent > limit.limit;

const getExceededAmount = (limit) => {
  return isLimitExceeded(limit) ? (limit.spent - limit.limit).toFixed(2) : 0;
};

// Save function to update the store directly
async function handleExpenseLimitSave(expenseLimit) {
  if (!expenseLimit) {
    isLimitDialogOpen.value = false;
    $q.notify({
      message: 'Expense limit deleted successfully!',
      color: 'positive',
      position: 'top-right',
      timeout: 2000
    });
  } else {
    await expensesStore.updateExpenseLimit(expenseLimit);  // Updates the store directly
    isLimitDialogOpen.value = false;  // Close dialog
    $q.notify({
      message: 'Expense limit edited successfully!',
      color: 'positive',
      position: 'top-right',
      timeout: 2000
    });
  }
}
</script>

<style scoped>
.text-red {
  color: #e53935;
}

.text-green {
  color: #43a047;
}

.q-badge {
  font-size: 12px;
  padding: 2px 6px;
}

::v-deep .custom-expansion-item .q-item__section--avatar {
  color: var(--icon-color);       /* Only the icon color */
  font-size: 24px;   /* Only the icon size */
}
</style>
