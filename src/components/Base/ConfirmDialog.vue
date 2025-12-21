<template>
  <q-dialog v-model="isOpen" persistent class="modern-dialog">
    <q-card class="dialog-card">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="row items-center q-gutter-sm">
          <q-icon name="info" color="primary" size="24px" />
          <h6>Confirmation Required</h6>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Content -->
      <q-card-section class="dialog-content">
        <div class="explanation-box">
          <p class="text-body2">
            When you confirm, expenses will be adjusted based on tags added to the categories.
          </p>
          <p class="text-body2 q-mb-none">
            For example, tag 'Supermarket' will assign the related category to every expense that contains that keyword.
          </p>
        </div>

        <div class="confirmation-text q-mt-md">
          Are you sure you want to proceed?
        </div>
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions class="dialog-actions">
        <q-btn label="Cancel" class="btn-secondary" @click="closeDialog" />
        <q-space />
        <q-btn label="Confirm" class="btn-primary" @click="confirmAction" />
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

<style scoped lang="scss">
.modern-dialog {
  :deep(.q-dialog__backdrop) {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
  }
}

.dialog-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  max-width: 480px;
  width: 100%;
}

.dialog-header {
  padding: 24px 24px 16px;

  h6 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: #263238;
  }

  .q-icon {
    opacity: 0.9;
  }
}

.dialog-content {
  padding: 24px;
}

.explanation-box {
  background: rgba(30, 136, 229, 0.08);
  border-left: 4px solid #1E88E5;
  border-radius: 8px;
  padding: 16px;

  .text-body2 {
    font-size: 14px;
    line-height: 1.6;
    color: #424242;
    margin-bottom: 8px;
  }
}

.confirmation-text {
  font-size: 15px;
  font-weight: 500;
  color: #263238;
  text-align: center;
}

.dialog-actions {
  padding: 16px 24px 24px;
  gap: 12px;
}

.btn-primary {
  background: #1E88E5;
  color: white;
  border-radius: 8px;
  min-width: 100px;
  height: 40px;
  font-weight: 500;
  text-transform: none;
  box-shadow: 0 2px 8px rgba(30, 136, 229, 0.25);
  transition: all 0.2s ease;

  &:hover {
    background: #1565C0;
    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.35);
  }
}

.btn-secondary {
  background: transparent;
  color: #757575;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  min-width: 100px;
  height: 40px;
  text-transform: none;
  transition: all 0.2s ease;

  &:hover {
    background: #FAFAFA;
    border-color: #BDBDBD;
  }
}

// Dark Mode
body.body--dark {
  .dialog-card {
    background: #1E1E1E;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }

  .dialog-header h6 {
    color: #FFFFFF;
  }

  .explanation-box {
    background: rgba(30, 136, 229, 0.15);
    border-left-color: #42A5F5;

    .text-body2 {
      color: #E0E0E0;
    }
  }

  .confirmation-text {
    color: #FFFFFF;
  }

  .btn-secondary {
    border-color: #424242;
    color: #B0B0B0;

    &:hover {
      background: #2A2A2A;
      border-color: #525252;
    }
  }
}
</style>
