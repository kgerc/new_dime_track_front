<template>
    <q-dialog v-model="isOpen">
      <q-card style="width: 400px">
        <q-card-section class="row justify-between items-center">
          <div class="text-h6">{{ isNewSavingGoal ? 'New Saving Goal' : 'Edit Saving Goal' }}</div>

          <!-- Currency Dropdown -->
          <q-select
            v-model="localSavingGoal.currency"
            :options="currencyOptions"
            dense
            outlined
            style="min-width: 100px;"
          />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="localSavingGoal.title" label="Title" outlined dense />
          <q-input
            v-model.number="localSavingGoal.amount"
            :prefix="getCurrencySymbol(localSavingGoal.currency)"
            label="Amount"
            type="number"
            outlined
            dense />
          <q-input v-model="localSavingGoal.notes" label="Notes" outlined dense />
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
  import { getCurrencySymbol } from 'src/helpers/formatCurrency.js'

  const props = defineProps({
    modelValue: Boolean,  // Controls dialog visibility
    savingGoal: Object,
    isNewSavingGoal: Boolean, // Flag to distinguish between new and existing expense
  });

  const emit = defineEmits(['update:modelValue', 'save']);
  const currencyOptions = ["PLN", "PLN", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];
  const localSavingGoal = ref({ ...props.savingGoal });  // Local copy for editing

  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });

  watch(isOpen, (newVal) => {
    if (newVal) {
      const newSavingGoal = props.isNewSavingGoal
        ? { id: uuidv4(), title: '', notes: '', amount: 0, currency: 'PLN', savingContributions: [] }
        : { ...props.savingGoal };
       localSavingGoal.value = newSavingGoal;
    }
  });

  function closeDialog() {
    emit('update:modelValue', false);
  }

  function saveChanges() {
    emit('save', localSavingGoal.value);  // Send updated expense back
    closeDialog();
  }
  </script>
