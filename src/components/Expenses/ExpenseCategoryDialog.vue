<template>
    <q-dialog v-model="isOpen">
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">New Expense Category</div>
        </q-card-section>
  
        <q-card-section class="q-gutter-md">
          <q-input v-model="localCategory.name" placeholder="Category Name" outlined dense />
          <q-input
            placeholder="Category Color"
            outlined
            v-model="localCategory.color"
            class="my-input"
        >
            <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color v-model="localCategory.color" />
                </q-popup-proxy>
            </q-icon>
            </template>
        </q-input>


        </q-card-section>
  
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" @click="closeDialog" />
          <q-btn flat label="Save" color="primary" @click="saveCategory" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref, computed, watch } from 'vue'
  
  const props = defineProps({
    modelValue: Boolean  // Controls dialog visibility
  })
  
  const emit = defineEmits(['update:modelValue', 'save'])
  
  const localCategory = ref({
    name: '',
    color: '#ffffff'
  })
  
  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  function closeDialog() {
    emit('update:modelValue', false)
  }
  
  function saveCategory() {
    emit('save', localCategory.value)  // Emit saved category data
    closeDialog()
  }
  </script>
  