<template>
  <q-page class="q-pa-md">
    <q-card class="upload-card">
      <q-card-section>
        <h5 class="text-h5">{{ t('uploadTitle') }}</h5>
        <p class="text-caption text-grey">
          {{ t('uploadSubtitle') }}
        </p>
      </q-card-section>

      <q-card-section>
        <div class="drop-zone">
          <q-file
            v-model="file"
            :label="t('fileLabel')"
            filled
            use-chips
            use-drop
            accept=".csv"
            @update:model-value="onFileSelected"
          />
        </div>
      </q-card-section>

      <q-card-section style="margin-top: -70px;">
        <h6 class="text-h6">{{ t('savingsKeywords') }}</h6>
        <q-input
          v-model="newKeyword"
          :label="t('addSavingsKeyword')"
          filled
          dense
          @keyup.enter="addKeyword"
        />
        <div class="q-mt-md">
          <q-chip
            v-for="(keyword, index) in savingsKeywords"
            :key="index"
            removable
            @remove="removeKeyword(index)"
          >
            {{ keyword }}
          </q-chip>
        </div>
      </q-card-section>

      <q-card-section v-if="parsedData.length > 0" style="margin-top: -55px;">
        <h6 class="text-h6">{{ t('previewTitle') }}</h6>
        <q-table
          :rows="parsedData"
          :columns="columns"
          row-key="id"
          dense
          flat
          :rows-per-page-options="[5, 10]"
        />

        <q-btn
          :label="t('uploadToServer')"
          color="primary"
          class="q-mt-md"
          @click="uploadTransactions"
          :loading="loading"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import Papa from 'papaparse';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useImportTransactionsStore } from 'src/stores/importTransactionsStore';
import { useLangStore } from "src/stores/langStore"
// Store setup
const importTransactionsStore = useImportTransactionsStore();
const { file, parsedData, columns, savingsKeywords } = storeToRefs(importTransactionsStore);
const newKeyword = ref("");
const $q = useQuasar();
const { t } = useLangStore();
const loading = ref(false);

const columnMapping = {
  "description": ["Description", "TransactionTitle", "Opis", "TransaktionBeschreibung"],
  "date": ["Date", "TransactionDate", "Data", "Data operacji"],
  "amount": ["Amount", "Kwota", "Betrag"],
  "currency": ["Currency", "Waluta"],
  "balanceAfterTransaction": ["Saldo po transakcji"]
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

const parseCSV = (file) => {
  const reader = new FileReader();

  reader.onload = (event) => {
    const arrayBuffer = event.target.result;

    // Decode the content using Windows-1252 (a common encoding for Polish)
    const text = new TextDecoder('windows-1252').decode(arrayBuffer);

    // Apply manual fixes to correct any misinterpreted characters
    const fixedContent = manualFix(text);
    debugger;
    // Parse the content using PapaParse
    Papa.parse(fixedContent, {
      header: true,
      delimiter: ",",
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mappedData = results.data.map(row => ({
          date: mapColumnValue(row, 'date'),
          description: extractMerchant(row), // Extracts Merchant Name or Fallback
          amount: mapColumnValue(row, 'amount'),
          currency: mapColumnValue(row, 'currency'),
          balanceAfterTransaction: mapColumnValue(row, 'balanceAfterTransaction')
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

  // Read the file as an ArrayBuffer
  reader.readAsArrayBuffer(file);
};

const addKeyword = () => {
  if (newKeyword.value.trim() && !savingsKeywords.value.includes(newKeyword.value.trim())) {
    savingsKeywords.value.push(newKeyword.value.trim());
    newKeyword.value = "";
  }
};

const removeKeyword = (index) => {
  savingsKeywords.value.splice(index, 1);
};

// Fix function to handle misinterpreted characters
const manualFix = (text) => {
  return text
    .replace(/[ý]/g, 'l')  // Replace misinterpreted 'ý' with 'ł'
    .replace(/[£]/g, 'L')  // Replace '£' with 'Ł'
    .replace(/[¯]/g, 'Z')  // Replace '¯' with 'Ą'
    .replace(/[´]/g, 'e')  // Replace accented characters
    .replace(/[Å]/g, 'Z')  // Polish 'Ż'
    .replace(/[Ö]/g, 'Z')  // Another possible misinterpretation of 'Ż'
    .replace(/[ý]/g, 'Z')  // Replace wrongly interpreted 'ý' with 'Ż' (if that's the case)
    .replace(/[ü]/g, 'A')  // Misinterpreted 'ü' could be 'Ą'
    .replace(/[ç]/g, 'C')  // Misinterpreted 'ç' to 'Ć'
    .replace(/[À]/g, 'S')  // Misinterpreted 'À' with 'Ś'
    .replace(/[\u0080-\u009F]/g, '') // Remove unwanted control characters
    .replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII characters, cleaning up unwanted ones
};

// Function to map column values based on possible names
const mapColumnValue = (row, field) => {
  const possibleNames = columnMapping[field];
  debugger;
  for (let name of possibleNames) {
    if (row[name]) {
      return field === 'amount' || field === 'balanceAfterTransaction'
        ? parseFloat(row[name])
        : row[name];
    }
  }
  return null;
};

// Function to extract merchant name from a column
const extractMerchant = (row) => {
  if (row['']) {
    let locationText = row[''];
    let locationText2 = row['_1'];

    // Improved regex to handle URLs properly in both locationText and locationText2
    // Capture the address or URL after 'Adres:' until we encounter 'Miasto:', 'Kraj:', or end of string
    let expenseMatch = locationText.match(/Adres:\s+(.+?)(?=\s+(?:Miasto:|Kraj:|$))/i);
    let expenseMatch2 = locationText2.match(/Adres:\s+(.+?)(?=\s+(?:Miasto:|Kraj:|$))/i);
    let expenseMatch3 = locationText2.match(/Adres:\s+(.+)/i);
    let expenseMatch4 = locationText.match(/Tytu:\s+(.+)/i);
    let incomeMatch = locationText.match(/Nazwa (?:nadawcy|odbiorcy):\s+(.+)/i); // Capture full name

    let extractedText = "";
    // If a match for locationText or locationText2 is found, use the address or URL found
    if (expenseMatch && expenseMatch[1]) {
      extractedText = expenseMatch[1].trim();
    } else if (expenseMatch2 && expenseMatch2[1]) {
      extractedText = expenseMatch2[1].trim();
    } else if (incomeMatch && incomeMatch[1]) {
      extractedText = incomeMatch[1].trim();
    } else if (expenseMatch3 && expenseMatch3[1]) {
      extractedText = expenseMatch3[1].trim();
    } else if (expenseMatch4 && expenseMatch4[1]) {
      // If "SPLATA" is part of the matched text from 'Tytu:', return only the part after 'SPLATA'
      let splataMatch = expenseMatch4[1].match(/^SPLATA\s+([^\s]+)/i);
      if (splataMatch) {
        extractedText = `splata place pozniej`;  // Extracts just the part after "SPLATA"
      }
    } else {
      extractedText = row['Typ transakcji'] || 'Unknown';
    }

    // Handle cases where the address may contain URLs (including ones without http:// or https://)
    if (extractedText.match(/(?:https?:\/\/|www\.)[^\s]+/i)) {
      return extractedText.trim();
    }

    return extractedText;
  }
  return row['Opis transakcji'] || 'Unknown';
};


// Function to upload transactions to API
const uploadTransactions = async () => {
  if (parsedData.value.length === 0) {
    $q.notify({
        message: 'No transactions to upload',
        color: 'warning',
        position: 'top-right',
        timeout: 2000
      });
    return;
  }

  try {
    await importTransactionsStore.uploadTransactions()
    $q.notify({
        message: 'Transactions successfully uploaded!',
        color: 'positive',
        position: 'top-right',
        timeout: 2000
      });
  } catch (error) {
    console.error('Upload Error:', error);
    $q.notify({
        message: 'Error uploading transactions!',
        color: 'negative',
        position: 'top-right',
        timeout: 2000
      });
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
