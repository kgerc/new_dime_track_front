<template>
    <q-dialog v-model="isOpen">
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Expense</div>
        </q-card-section>
  
        <q-card-section class="q-gutter-md">
          <q-input v-model="localExpense.title" label="Title" outlined dense />
          <q-input v-model="localExpense.notes" label="Notes" outlined dense />
          <q-input v-model.number="localExpense.amount" label="Amount" type="number" outlined dense />
          <q-input v-model="localExpense.recurrence" label="Recurrence" outlined dense />
          <q-input v-model="localExpense.paymentDate" label="Payment Date" type="date" outlined dense />
          
          <q-toggle v-model="localExpense.isPaid" label="Paid?" />
  
          <q-select
            v-model="localExpense.expenseCategoryId"
            :options="categories"
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
  import { defineProps, defineEmits, ref, computed } from 'vue'
  
  const props = defineProps({
    modelValue: Boolean,  // Controls dialog visibility
    expense: Object,
    categories: Array, // List of expense categories
  })
  
  const emit = defineEmits(['update:modelValue', 'save'])
  
  const localExpense = ref({ ...props.expense }) // Copy expense for local editing
  
  // Watch for prop changes and update localExpense
  import { watch } from 'vue'
  watch(() => props.expense, (newExpense) => {
    localExpense.value = { ...newExpense }
  }, { deep: true })
  
  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  function closeDialog() {
    emit('update:modelValue', false)
  }
  
  function saveChanges() {
    emit('save', localExpense.value) // Send updated expense back
    closeDialog()
  }
  </script>
  