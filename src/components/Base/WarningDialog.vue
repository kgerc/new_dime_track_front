<template>
  <q-dialog v-model="isOpen" persistent class="modern-dialog">
    <q-card class="dialog-card warning-dialog">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <div class="row items-center q-gutter-sm">
          <q-icon name="warning" color="negative" size="24px" />
          <h6>Delete Confirmation</h6>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Content -->
      <q-card-section class="dialog-content">
        <div class="warning-text">
          Are you sure you want to delete this item?
        </div>
        <div class="warning-subtext">
          This action cannot be undone.
        </div>
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions class="dialog-actions">
        <q-btn label="Cancel" class="btn-secondary" @click="closeDialog" />
        <q-space />
        <q-btn label="Delete" class="btn-danger" @click="confirmDelete" />
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
  max-width: 400px;
  width: 100%;

  &.warning-dialog {
    border-top: 4px solid #EF5350;
  }
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

.warning-text {
  font-size: 15px;
  font-weight: 500;
  color: #263238;
  margin-bottom: 8px;
}

.warning-subtext {
  font-size: 13px;
  color: #757575;
  font-style: italic;
}

.dialog-actions {
  padding: 16px 24px 24px;
  gap: 12px;
}

.btn-danger {
  background: #EF5350;
  color: white;
  border-radius: 8px;
  min-width: 100px;
  height: 40px;
  font-weight: 500;
  text-transform: none;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.25);
  transition: all 0.2s ease;

  &:hover {
    background: #E53935;
    box-shadow: 0 4px 12px rgba(239, 83, 80, 0.35);
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

    &.warning-dialog {
      border-top-color: #FF6659;
    }
  }

  .dialog-header h6 {
    color: #FFFFFF;
  }

  .warning-text {
    color: #FFFFFF;
  }

  .warning-subtext {
    color: #B0B0B0;
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
