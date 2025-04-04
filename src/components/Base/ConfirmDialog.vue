<template>
    <q-dialog v-model="isOpen" persistent>
        <q-card class="q-pa-sm">
        <!-- Explanation Section -->
        <q-card-section>
            <div class="text-body2 text-grey-8 bg-grey-2 q-pa-sm q-rounded-borders text-center">
                When you confirm, expenses will be adjusted based on tags added to the categories. <br />
                (For example, tag 'Supermarket' will add the related category to every expense that contains that keyword.)
            </div>
        </q-card-section>

        <!-- Confirmation Prompt -->
        <q-card-section class="row justify-center items-center q-gutter-sm">
            <q-icon name="info" color="primary" size="md" />
            <span class="text-subtitle1">Are you sure you want to proceed?</span>
        </q-card-section>

        <!-- Action Buttons -->
        <q-card-actions>
            <q-btn flat label="Cancel" color="grey" @click="closeDialog" />
            <q-space />
            <q-btn flat label="Confirm" color="positive" @click="confirmAction" />
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

function confirmAction() {
  emit('confirm');
  closeDialog();
}

</script>
