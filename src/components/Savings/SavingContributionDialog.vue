<template>
    <q-dialog v-model="isOpen">
      <q-card style="width: 400px">
        <q-card-section class="row justify-between items-center">
          <div class="text-h6">{{ isNewSavingContribution ? 'New Saving Contribution' : 'Edit Saving Contribution' }}</div>
          
          <!-- Currency Dropdown -->
          <q-select
            v-model="localSavingContribution.currency"
            :options="currencyOptions"
            dense
            outlined
            style="min-width: 100px;"
          />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input 
            v-model.number="localSavingContribution.amount" 
            :prefix="getCurrencySymbol(localSavingContribution.currency)" 
            label="Amount" 
            type="number" 
            outlined 
            dense />
          <q-input v-model="localSavingContribution.contributionDate" label="Payment Date" type="date" outlined dense />
          <q-select
            v-model="savingGoalTitle"
            :options="savingGoalTitles"
            label="Saving Goals"
            outlined
            dense
          />
        </q-card-section>
  
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" @click="closeDialog" />
          <q-space />  <!-- This pushes the next buttons to the right -->
          <q-btn v-if="!isNewSavingContribution" flat label="Delete" color="negative" @click="isWarningDialogOpened = true;"/>
          <q-btn flat label="Save" color="primary" @click="saveChanges" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <WarningDialog v-model="isWarningDialogOpened" @confirm="deleteSavingContribution" />
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref, computed, watch } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  import { format } from 'date-fns';
  import { useSavingsStore } from 'src/stores/savingsStore.js';
  import { storeToRefs } from 'pinia';
  import { getCurrencySymbol } from 'src/helpers/formatCurrency.js'
  import WarningDialog from 'src/components/Base/WarningDialog.vue'
  
  const savingsStore = useSavingsStore();
  const { entries } = storeToRefs(savingsStore); 
  
  const props = defineProps({
    modelValue: Boolean,  
    savingContribution: Object,
    isNewSavingContribution: Boolean
  });
  
  const emit = defineEmits(['update:modelValue', 'save']);
  const currencyOptions = ["PLN", "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];
  const localSavingContribution = ref({ ...props.savingContribution });  // Local copy for editing
  const isWarningDialogOpened = ref(false)
  
  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });
  
  // Get category titles from Pinia store
  const savingGoalTitles = computed(() => {
    return entries.value.map(entry => entry.title);
  });
  
  // Bind category title to localSavingContribution
  const savingGoalTitle = computed({
    get: () => localSavingContribution.value.savingGoal?.title || null,
    set: (value) => {
      const savingGoalByName = entries.value.find(entry => entry.title === value);
      if (!localSavingContribution.value.savingGoal) {
        localSavingContribution.value.savingGoal = {};  // Create if null
      }
      localSavingContribution.value.savingGoal = savingGoalByName;
    }
  });
  
  // Watch for dialog open and reset localSavingContribution accordingly
  watch(isOpen, (newVal) => {
    if (newVal) {
      const newSavingContribution = props.isNewSavingContribution
        ? { id: uuidv4(), amount: 0, currency: 'PLN', contributionDate: '', savingGoal: null }
        : { ...props.savingContribution, contributionDate: format(new Date(props.savingContribution.contributionDate), 'yyyy-MM-dd') };
  
        localSavingContribution.value = newSavingContribution;
        savingGoalTitle.value = newSavingContribution.savingGoalTitle || newSavingContribution.savingGoal?.title;
    }
  });
  
  function closeDialog() {
    emit('update:modelValue', false);
  }
  
  async function deleteSavingContribution() {
    await savingsStore.removeSavingContribution(localSavingContribution.value)
    emit('save', null) 
  };

  function saveChanges() {
    emit('save', localSavingContribution.value);  // Send updated expense back
    closeDialog();
  }
  </script>
  