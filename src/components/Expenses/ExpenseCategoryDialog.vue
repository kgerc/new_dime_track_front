<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 400px">
      <q-card-section>
        <div class="text-h6">{{ isNewCategory ? 'New Expense Category' : 'Edit Expense Category' }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="localCategory.title" placeholder="Category Name" outlined dense />
        <q-input
          placeholder="Category Color"
          outlined
          v-model="localCategory.color"
          class="my-input"
      >
          <template v-slot:prepend>
              <q-icon name="circle" :style="{ color: localCategory.color, marginLeft: '-2px' }" class="q-ml-xs"/>
          </template>
          <template v-slot:append>
          <q-icon name="colorize" class="cursor-pointer" :color="localCategory.color">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-color v-model="localCategory.color" />
              </q-popup-proxy>
          </q-icon>
          </template>
      </q-input>

      <div style="min-height: 80px;">
        <q-input v-model="newTag" @keyup.enter="addTag" placeholder="Add tag" dense outlined class="q-mt-sm" />
        <q-chip v-if="!localCategory.tags || localCategory.tags?.length === 0" style="margin-top: 10px;">Example tag</q-chip>
        <q-chip v-for="(tag, index) in localCategory.tags" :key="index" removable @remove="removeTag(index)" style="margin-top: 10px;">
          {{ tag }}
        </q-chip>
      </div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat label="Cancel" color="grey" @click="closeDialog" />
        <q-space />  <!-- This pushes the next buttons to the right -->
        <q-btn v-if="!isNewCategory" flat label="Delete" color="negative" @click="isWarningDialogOpened = true;"/>
        <q-btn flat label="Save" color="primary" @click="saveCategory" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <WarningDialog v-model="isWarningDialogOpened" @confirm="deleteCategory" />
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import WarningDialog from 'src/components/Base/WarningDialog.vue'
import { useExpensesStore } from 'src/stores/expensesStore';

const props = defineProps({
  modelValue: Boolean,
  category: Object,
  isNewCategory: Boolean
})
const expensesStore = useExpensesStore();
const emit = defineEmits(['update:modelValue', 'save'])

const localCategory = ref({ ...props.category })
const newTag = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

watch(isOpen, (newVal) => {
  if (newVal) {
    localCategory.value = props.isNewCategory 
      ? { id: uuidv4(), title: '', color: '', tags: [] }
      : { ...props.category }
  }
})

function closeDialog() {
  emit('update:modelValue', false)
}

function addTag() {
  if (newTag.value.trim() && !localCategory.value.tags.includes(newTag.value.trim())) {
    localCategory.value.tags.push(newTag.value.trim())
  }
  newTag.value = ''
}

function removeTag(index) {
  localCategory.value.tags.splice(index, 1)
}

const isWarningDialogOpened = ref(false)
async function deleteCategory() {
  emit('save', null) 
  await expensesStore.removeExpenseCategory(localCategory.value.id)
}

function saveCategory() {
  emit('save', localCategory.value)
  closeDialog()
}
</script>
