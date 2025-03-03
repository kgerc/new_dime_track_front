<template>
    <q-dialog v-model="isOpen">
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">Set Expense Limit</div>
        </q-card-section>
  
        <q-card-section class="q-gutter-md">
          <!-- Limit Type -->
          <q-select
            v-model="localLimit.type"
            :options="limitOptions"
            label="Limit Type"
            outlined
            dense
          />
  
          <!-- Select Category if applicable -->
          <q-select
            v-if="localLimit.type === 'Category'"
            v-model="localLimit.categoryId"
            :options="categories.map(cat => ({ label: cat.name, value: cat.id }))"
            label="Category"
            outlined
            dense
          />
  
          <!-- Limit Amount -->
          <q-input
            v-model.number="localLimit.amount"
            type="number"
            label="Limit Amount"
            prefix="€"
            outlined
            dense
          />
  
          <!-- Recurrence Options -->
          <q-select
            v-model="localLimit.recurrence"
            :options="recurrenceOptions"
            label="Recurrence"
            outlined
            dense
          />
        </q-card-section>
  
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" @click="closeDialog" />
          <q-btn flat label="Save" color="primary" @click="saveLimit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref, computed, watch } from 'vue';
  import { useExpensesStore } from 'src/stores/expensesStore';
  import { v4 as uuidv4 } from 'uuid';
  
  const props = defineProps({
    modelValue: Boolean  // Controls dialog visibility
  });
  
  const emit = defineEmits(['update:modelValue', 'save']);
  
  const expensesStore = useExpensesStore();
  
  const localLimit = ref({
    id: uuidv4(),
    type: 'General',
    categoryId: null,
    amount: null,
    recurrence: 'Monthly',
  });
  
  const limitOptions = [
    { label: 'General', value: 'General' },
    { label: 'Category', value: 'Category' },
  ];
  
  const recurrenceOptions = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Every 3 Months', value: 'Quarterly' },
    { label: 'Every 6 Months', value: 'Semi-Annual' },
    { label: 'Every Year', value: 'Annual' },
  ];
  
  const categories = computed(() => expensesStore.categories);
  
  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  watch(isOpen, (newVal) => {
    if (newVal) {
      resetForm();  // Reset form when dialog is opened
    }
  });
  
  function closeDialog() {
    emit('update:modelValue', false);
  }
  
  function saveLimit() {
    emit('save', localLimit.value);  // Emit saved limit data
    closeDialog();
  }
  
  function resetForm() {
    localLimit.value = {
      id: uuidv4(),
      type: 'General',
      categoryId: null,
      amount: null,
      recurrence: 'Monthly',
    };
  }
  </script>
  