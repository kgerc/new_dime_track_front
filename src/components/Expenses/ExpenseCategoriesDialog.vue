<template>
    <q-dialog v-model="isOpen">
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">Expense Categories</div>
        </q-card-section>

        <q-list bordered padding class="q-pa-none">
          <q-item v-for="category in categories" :key="category.id" clickable @click="openEditCategoryDialog(category)">
            <q-item-section avatar>
              <q-icon name="circle" :style="{ color: category.color }" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ category.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="closeDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <ExpenseCategoryDialog v-model="isEditDialogOpen" @save="saveEditedCategory" :isNewCategory="false" :category="categoryToEdit"/>
  </template>

  <script setup>
  import { defineProps, defineEmits, ref, computed } from 'vue'
  import { useQuasar } from 'quasar'
  import { useExpensesStore } from 'src/stores/expensesStore';
  import ExpenseCategoryDialog from 'src/components/Expenses/ExpenseCategoryDialog.vue';
  import { storeToRefs } from 'pinia';

  const $q = useQuasar();
  const expensesStore = useExpensesStore();
  const { categories } = storeToRefs(expensesStore);  // Use storeToRefs to access reactive properties

  const props = defineProps({
    modelValue: Boolean
  })

  const emit = defineEmits(['update:modelValue', 'save', 'isCategoryEdited'])

  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const isEditDialogOpen = ref(false)
  const isCategoryEdited = ref(false)
  let categoryToEdit = ref(null)

  function openEditCategoryDialog(category) {
    categoryToEdit = { ...category }
    isEditDialogOpen.value = true;
  }

  function closeDialog() {
    emit('update:modelValue', false)
    emit('isCategoryEdited', isCategoryEdited.value)
  }

  async function saveEditedCategory(expenseCategory) {
    if (!expenseCategory) {
      isEditDialogOpen.value = false;
      isCategoryEdited.value = true;
      $q.notify({
        message: 'Expense category deleted successfully!',
        color: 'positive',
        position: 'top-right',
        timeout: 2000
      });
    }
    else
    {
      await expensesStore.updateExpenseCategory(expenseCategory);  // Updates the store directly
      isEditDialogOpen.value = false;  // Close dialog
      isCategoryEdited.value = true;
      $q.notify({
        message: 'Expense category edited successfully!',
        color: 'positive',
        position: 'top-right',
        timeout: 2000
      });
    }
  }
  </script>
