<template>
  <q-card style="width: 100%; max-width: 400px;">
    <q-card-section class="text-center q-py-sm">
      <div class="text-h6">Expense Limits</div>
      <div class="text-body2">
        Spent: {{ totalSpent }} USD / Limit: {{ totalLimit }} USD
      </div>
      <q-linear-progress
        :value="getProgressValue"
        :color="getProgressColor"
        size="10px"
        rounded
        stripe
      />
    </q-card-section>
      <q-list bordered style="width: 360px; height:580px; overflow-y: auto;" class="custom-scroll">
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
                  Spent: {{ formatCurrency(limit.spent, 'USD', true) }} / Limit: {{ limit.limit }} USD
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
                      Exceeded by {{ getExceededAmount(limit) }} USD
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
                  @click="editLimit(limit)"
                  />
              </div>
              </q-item-section>
          </q-item>
          <ExpenseLimitDialog
              v-model="isLimitDialogOpen"
              :limit="limit"
              :isNewLimit="false"
              @save="handleExpenseLimitSave"
          />
          </q-expansion-item>
      </q-list>
  </q-card>
</template>


  <script setup>
  import { ref, computed, watch } from 'vue';
  import { useQuasar } from 'quasar';
  import ExpenseLimitDialog from 'src/components/Expenses/ExpenseLimitDialog.vue';
  import { useExpensesStore } from 'src/stores/expensesStore';
  import { useBalancesStore } from 'src/stores/balancesStore'
  import { formatCurrency } from 'src/helpers/formatCurrency.js'
  import { storeToRefs } from 'pinia'

  const $q = useQuasar();
  const expensesStore = useExpensesStore();

  const balancesStore = useBalancesStore()
  const { currentMonthRemainingLimit } = storeToRefs(balancesStore)

  const props = defineProps({
    limits: Array,
    modelValue: Boolean,
    monthName: String,
    currentMonth: Number,
    selectedMonth: Number
  });

  const emit = defineEmits(['update:modelValue']);

  const isLimitDialogOpen = ref(false);

  // Computed properties for totals based on the store data
  const totalSpent = computed(() => {
    return props.limits.reduce((sum, limit) => sum + (limit?.spent ?? 0), 0).toFixed(2);
  });

  const totalLimit = computed(() => {
    return props.limits.reduce((sum, limit) => sum + limit.limit, 0).toFixed(2);
  });

  const getProgressValue = computed(() => {
    var progressValue = totalSpent.value / totalLimit.value;
    if (!progressValue) return 0;
    return progressValue;
  })

  const getProgressColor = computed(() => {
    return getProgressValue.value > 1 ? 'red' : 'blue'
  })

  watch(
    [() => props.currentMonth, () => props.selectedMonth, getProgressValue, totalLimit, totalSpent],
    () => {
      if (props.currentMonth === props.selectedMonth && getProgressValue.value < 1) {
        currentMonthRemainingLimit.value = totalLimit.value - totalSpent.value;
      }
    },
    { immediate: true }
  );

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
