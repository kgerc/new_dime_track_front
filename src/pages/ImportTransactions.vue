<template>
  <q-page class="q-pa-md">
    <q-card class="upload-card">
      <q-card-section>
        <h5 class="text-h5">Upload Transactions (CSV)</h5>
        <p class="text-caption text-grey">
          Drag & drop your CSV file here or click to select a file.
        </p>
      </q-card-section>

      <q-card-section>
        <div class="drop-zone">
          <q-file
            v-model="file"
            label="Drop CSV file here or click to upload"
            filled
            use-chips
            use-drop
            accept=".csv"
            @update:model-value="onFileSelected"
          />
        </div>
      </q-card-section>

      <q-card-section v-if="parsedData && parsedData.length > 0">
        <h6 class="text-h6">Preview (First 5 Transactions)</h6>
        <q-table
          :rows="parsedData"
          :columns="columns"
          row-key="id"
          dense
          flat
          :rows-per-page-options="[5, 10]" 
        />
        
        <q-btn
          label="Upload to Server"
          color="primary"
          class="q-mt-md"
          @click="uploadTransactions"
          :loading="loading"
        />
      </q-card-section>

      <q-card-section v-if="message">
        <q-banner :class="success ? 'bg-green text-white' : 'bg-red text-white'">
          {{ message }}
        </q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import Papa from 'papaparse';
import { storeToRefs } from 'pinia';
import { useImportTransactionsStore } from 'src/stores/importTransactionsStore';

// Pinia Store
const importTransactionsStore = useImportTransactionsStore();
const { file, parsedData, columns } = storeToRefs(importTransactionsStore);

// Reactive State
const loading = ref(false);
const message = ref('');
const success = ref(false);

const columnMapping = {
  "description": ["Description", "TransactionTitle", "Opis", "TransaktionBeschreibung"],
  "date": ["Date", "TransactionDate", "Data", "Data waluty"],
  "amount": ["Amount", "Kwota", "Betrag"],
  "currency": ["Currency", "Waluta"]
};

// Function to handle file selection
const onFileSelected = (selectedFile) => {
  if (selectedFile) {
    parseCSV(selectedFile);
  } else {
    parsedData.value = [];
    columns.value = [];
    message.value = '';
  }
};

// Function to parse CSV file
const parseCSV = (file) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    Papa.parse(event.target.result, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mappedData = results.data.map(row => ({
          date: mapColumnValue(row, 'date'),
          description: extractMerchant(row), // Extracts Merchant Name or Fallback
          amount: mapColumnValue(row, 'amount'),
          currency: mapColumnValue(row, 'currency')
        }));

        parsedData.value = mappedData;

        columns.value = Object.keys(parsedData.value[0] || {}).map(col => ({
          name: col,
          label: col.charAt(0).toUpperCase() + col.slice(1),
          field: col,
          align: 'left'
        }));
        console.log('CSV DATA', results)
        console.log('Parsed CSV Data:', parsedData.value);
      }
    });
  };
  reader.readAsText(file);
};

// Function to map column values based on possible names
const mapColumnValue = (row, field) => {
  const possibleNames = columnMapping[field];
  for (let name of possibleNames) {
    if (row[name]) {
      return field === 'amount' ? parseFloat(row[name]) : row[name];
    }
  }
  return null;
};

// Function to extract merchant name from a column
const extractMerchant = (row) => {
  if (row['']) {
    let locationText = row[''];
    let locationText2 = row['_1'];
    let expenseMatch = locationText.match(/Adres:\s+([\w\s]+)/i);
    let expenseMatch2 = locationText2.match(/Adres:\s+([\w\s]+)/i);
    let incomeMatch = locationText.match(/Nazwa nadawcy:\s+([\w\s]+)/i);
    if (expenseMatch && expenseMatch[1]) {
      return expenseMatch[1].trim();
    } else if (expenseMatch2 && expenseMatch2[1]) {
      return expenseMatch2[1].trim();
    } else if (incomeMatch && incomeMatch[1]) {
      return incomeMatch[1].trim();
    }
  }
  return row['Opis transakcji'] || 'Unknown';
};

// Function to upload transactions to API
const uploadTransactions = async () => {
  if (parsedData.value.length === 0) {
    message.value = 'No transactions to upload!';
    success.value = false;
    return;
  }

  loading.value = true;
  message.value = '';

  try {
    await importTransactionsStore.uploadTransactions()
    message.value = 'Transactions uploaded successfully!';
    success.value = true;
  } catch (error) {
    console.error('Upload Error:', error);
    message.value = 'Error uploading transactions.';
    success.value = false;
  } finally {
    loading.value = false;
  }
};
</script>


<style scoped>
.upload-card {
  max-width: 600px;
  margin: auto;
  text-align: center;
}
.drop-zone {
  border: 2px dashed #027be3;
  padding: 20px;
  border-radius: 8px;
  background: rgba(2, 123, 227, 0.1);
  cursor: pointer;
}
</style>
