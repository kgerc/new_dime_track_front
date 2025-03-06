<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 400px">
      <!-- Summary Section -->
      <q-card-section class="text-center q-py-sm">
        <div class="text-h6">Expense Limits</div>
        <div class="text-body2">
          Spent: €{{ totalSpent }} / Limit: €{{ totalLimit }}
        </div>
        <q-linear-progress
          :value="totalSpent / totalLimit"
          :color="totalSpent > totalLimit ? 'red' : 'primary'"
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
          icon="category"
          expand-separator
        >
          <q-item>
            <q-item-section>
              <q-chip>
                Spent: €{{ limit.spent }} / Limit: €{{ limit.limit }}
              </q-chip>
              <div
                :class="isLimitExceeded(limit) ? 'text-red' : 'text-green'"
                class="text-caption"
              >
                <q-icon
                  style="margin-left:10px;"
                  :name="isLimitExceeded(limit) ? 'error' : 'check_circle'"
                  :color="isLimitExceeded(limit) ? 'red' : 'green'"
                  size="sm"
                  class="q-mr-xs"
                />
                <span v-if="isLimitExceeded(limit)">
                  Exceeded by €{{ getExceededAmount(limit) }}
                </span>
                <span v-else>
                  Within limit
                </span>
              </div>
            </q-item-section>
          </q-item>
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

const props = defineProps({
  modelValue: Boolean,
  monthName: String,
  limits: {  // Receiving limits as a prop
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const closeDialog = () => {
  emit('update:modelValue', false);
};

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Computed properties for totals based on the prop data
const totalSpent = computed(() => {
  return props.limits.reduce((sum, limit) => sum + limit.spent, 0).toFixed(2);
});

const totalLimit = computed(() => {
  return props.limits.reduce((sum, limit) => sum + limit.limit, 0).toFixed(2);
});

// Helper methods
const getLimitCategory = (limit) => limit.expenseCategory.title;

const isLimitExceeded = (limit) => limit.spent > limit.limit;

const getExceededAmount = (limit) => {
  return isLimitExceeded(limit) ? (limit.spent - limit.limit).toFixed(2) : 0;
};
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
</style>
