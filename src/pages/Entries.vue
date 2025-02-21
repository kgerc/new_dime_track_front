<template>
  <q-page>
    <div class="q-pa-md">
      <q-list bordered separator>
        <q-slide-item v-for="entry in entries" :key="entry.id" 
           @right="onEntrySlideRight" right-color="negative">
            <template v-slot:right>
              <q-icon name="delete" />
            </template>
          <q-item>
            <q-item-section 
              class="text-weight-bold"
              :class="amountColor(entry.amount)">
              {{entry.name}}
            </q-item-section>

            <q-item-section 
              class="text-weight-bold"
              :class="amountColor(entry.amount)" 
              side>
              {{formatCurrency(entry.amount)}}
            </q-item-section>
          </q-item>
        </q-slide-item>
      </q-list>
    </div>
    <q-footer
      class="bg-transparent"
    >
      <div class="row q-mb-sm q-px-md q-py-sm shadow-up-3">
        <div class="col text-grey-7 text-h6">
          Balance
        </div>
        <div class="col text-h6 text-right" :class="amountColor(balance)">
          {{ formatCurrency(balance) }}
        </div>
      </div>
      <q-form 
        @submit="addEntry"
        class="row q-px-sm q-pb-sm q-col-gutter-sm bg-primary">
        <div class="col">
          <q-input 
            v-model="addEntryForm.name"
            ref="nameForm"
            outlined 
            dense
            bg-color="white"
            placeholder="Name" />
        </div>
        <div class="col">
          <q-input 
            v-model.number="addEntryForm.amount"
            input-class="text-right"
            outlined 
            dense
            type="number"
            step="0.01"
            bg-color="white"
            placeholder="Amount" />
        </div>
        <div class="col col-auto">
          <q-btn 
            round 
            color="primary"
            type="submit" 
            icon="add" />
        </div>
      </q-form>
    </q-footer>
  </q-page>
</template>

<script setup>
import {ref, computed, reactive} from 'vue';
import { uid } from 'quasar'
import {formatCurrency} from 'src/helpers/formatCurrency.js';
import {amountColor} from 'src/helpers/amountColor.js';
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

const balance = computed(() => {
  return entries.value.reduce((accumulator, {amount}) => {
      return accumulator + amount;
  }, 0)
})

const nameForm = ref(null)

const addEntryFormDefault = {
  name: '',
  amount: null
}

const addEntryForm = reactive({
  ...addEntryFormDefault
})

const addEntryFormReset = () => {
  Object.assign(addEntryForm, addEntryFormDefault)
  nameForm.value.focus()
}

const addEntry = () => {
  const newEntry = Object.assign({}, addEntryForm, {id: uid()})
  entries.value.push(newEntry)
  addEntryFormReset();
}

const onEntrySlideRight = () => {
  const newEntry = Object.assign({}, addEntryForm, {id: uid()})
  entries.value.push(newEntry)
  addEntryFormReset();
}

</script>
