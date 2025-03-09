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
  import { v4 as uuidv4 } from 'uuid'

  const props = defineProps({
    modelValue: Boolean,  // Controls dialog visibility,
    category: Object,
    isNewCategory: Boolean
  })
  
  const emit = defineEmits(['update:modelValue', 'save'])

  const localCategory = ref({ ...props.category })
  
  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  watch(isOpen, (newVal) => {
    debugger;
    if (newVal) {
      localCategory.value = props.isNewCategory 
      ? { id: uuidv4(), title: '', color: '' }
      : { ...props.category }
    }
  })
  
  function closeDialog() {
    emit('update:modelValue', false)
  }
  
  function saveCategory() {
    emit('save', localCategory.value)  // Emit saved category data
    closeDialog()
  }
  </script>
  