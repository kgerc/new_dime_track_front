<template>
    <q-dialog v-model="isOpen" persistent>
        <q-card>
            <q-card-section class="row items-center q-gutter-sm">
                <q-icon name="warning" color="negative" size="md"/>
                <span>Are you sure you want to delete this item?</span>
            </q-card-section>

            <q-card-actions>
                <q-btn flat label="Cancel" color="grey" @click="closeDialog" />
                <q-space /> 
                <q-btn flat label="Delete" color="negative" @click="confirmDelete" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const isOpen = ref(false);
const emit = defineEmits(['update:modelValue', 'confirm']);

function closeDialog() {
    emit('update:modelValue', false);
}

function confirmDelete() {
emit('confirm');  // Emit an event to parent when confirmed
closeDialog();
}

</script>
