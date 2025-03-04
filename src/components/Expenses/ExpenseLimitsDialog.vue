<template>
    <q-dialog v-model="isOpen">
      <q-card style="width: 400px">
        <!-- Header -->
        <q-card-section>
          <div class="text-h6">Expense Limits</div>
        </q-card-section>
  
        <!-- Existing Limits List -->
        <q-card-section class="q-gutter-md">
          <div v-if="mockedLimits.length > 0">
            <q-list bordered>
              <q-item v-for="limit in mockedLimits" :key="limit.id">
                <q-item-section>
                  <div class="text-weight-bold">
                    {{ getLimitCategory(limit) }} - {{ limit.type }}
                  </div>
                  <div>
                    Spent: €{{ limit.spent }} / Limit: €{{ limit.amount }}
                  </div>
                  <div :class="isLimitExceeded(limit) ? 'text-red' : 'text-green'">
                    <span v-if="isLimitExceeded(limit)">
                      (Exceeded by €{{ getExceededAmount(limit) }})
                    </span>
                    <span v-else>
                      (Within limit)
                    </span>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div v-else class="text-grey-6 text-caption text-center">
            No limits set yet.
          </div>
        </q-card-section>
  
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
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const closeDialog = () => {
    emit('update:modelValue', false);
  };

  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  // Mocked data for limits
  const mockedLimits = ref([
    { id: 1, category: 'Food', amount: 300, spent: 350, type: 'Monthly' },
    { id: 2, category: 'Transport', amount: 150, spent: 120, type: 'Monthly' },
    { id: 3, category: 'Entertainment', amount: 200, spent: 250, type: 'Monthly' },
    { id: 4, category: 'Health', amount: 100, spent: 90, type: 'One-time' },
  ]);
  
  // Helper methods
  const getLimitCategory = (limit) => limit.category;
  
  const isLimitExceeded = (limit) => limit.spent > limit.amount;
  
  const getExceededAmount = (limit) => {
    if (isLimitExceeded(limit)) {
      return (limit.spent - limit.amount).toFixed(2);
    }
    return 0;
  };
  </script>
  
  <style scoped>
  .text-red {
    color: #e53935;
  }
  
  .text-green {
    color: #43a047;
  }
  </style>
  