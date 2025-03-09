<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 400px">
      <q-card-section>
        <div class="text-h6">{{ isNewLimit ? 'New Expense Limit' : 'Edit Expense Limit' }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="localLimit.title" label="Title" outlined dense />
        <q-input v-model.number="localLimit.limit" label="Limit Amount" type="number" outlined dense />

        <q-input v-model="localLimit.month" label="Month (e.g., 01 for January)" outlined dense />
        <q-input v-model="localLimit.year" label="Year (e.g., 2025)" outlined dense />

        <!-- Recurrence Frequency Dropdown -->
        <q-select
          v-model="localLimit.recurrenceFrequency"
          :options="recurrenceOptions"
          label="Recurrence"
          outlined
          dense
        />

        <!-- Repeat Count Input (only visible if a recurrence is selected) -->
        <q-input
          v-if="localLimit.recurrenceFrequency !== 'None'"
          v-model.number="localLimit.recurrence"
          label="Repeat Count"
          type="number"
          outlined
          dense
        />

        <q-select
          v-model="categoryTitle"
          :options="categoryTitles"
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
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
  modelValue: Boolean,  // Controls dialog visibility
  limit: Object,
  categories: Array, // List of expense categories
  isNewLimit: Boolean, // Flag to distinguish between new and existing limit
})

const emit = defineEmits(['update:modelValue', 'save'])

const localLimit = ref({ ...props.limit }) // Copy limit for local editing

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const categoryTitles = computed(() => {
  return props.categories.map(cat => cat.title)
})

const categoryTitle = computed({
  get: () => localLimit.value.expenseCategory?.title || null,
  set: (value) => {
    const categoryByName = props.categories
      .find(category => category.title === value)
    if (!localLimit.value.expenseCategory) {
      localLimit.value.expenseCategory = {} // Create if null
    }
    localLimit.value.expenseCategory = categoryByName
  }
})

// Watch for prop changes and update localLimit
watch(isOpen, (newVal) => {
  if (newVal) {
    props.limit.title = localLimit.value.title ?? localLimit.value.expenseCategory?.title;
    const newLimit = props.isNewLimit
      ? { id: uuidv4(), title: '', limit: 0, month: '', year: '', recurrence: 0, recurrenceFrequency: 'None', expenseCategory: null }
      : { ...props.limit }

    localLimit.value = newLimit
    categoryTitle.value = newLimit.expenseCategory?.title || null
  }
})

function closeDialog() {
  emit('update:modelValue', false)
}

function saveChanges() {
  // Convert month and year to integers before saving
  const limitToSave = { ...localLimit.value, month: parseInt(localLimit.value.month), year: parseInt(localLimit.value.year) }
  emit('save', limitToSave) // Send updated limit back
  closeDialog()
}

const recurrenceOptions = [
  'None', 'Monthly', 'Quarterly', 'Yearly'
];

</script>
