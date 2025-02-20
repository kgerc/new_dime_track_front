<template>
  <q-page>
    <div class="q-pa-md">
      <q-list bordered separator>
        <q-item v-for="entry in entries" :key="entry.id">
          <q-item-section :class="[
            {'text-positive': entry.amount > 0},
            {'text-negative': entry.amount < 0}
           ]">
            {{entry.name}}
          </q-item-section>

          <q-item-section :class="[
            {'text-positive': entry.amount > 0},
            {'text-negative': entry.amount < 0}
           ]" side>
            {{formatCurrency(entry.amount)}}
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import {ref} from 'vue';
import {formatCurrency} from 'src/helpers/formatCurrency.js';
const entries = ref([
  {
    id: 'id1',
    name: 'Salary',
    amount: 4999.99
  },
  {
    id: 'id2',
    name: 'Rent',
    amount: -999
  },
  {
    id: 'id3',
    name: 'Phone',
    amount: -14.99
  },
  {
    id: 'id4',
    name: 'Unknown',
    amount: 0
  }
])
</script>
