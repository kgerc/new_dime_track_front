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

      <q-card-section v-if="parsedData.length > 0">
        <h6 class="text-h6">Preview (First 5 Transactions)</h6>
        <q-table :rows="parsedData" :columns="columns" row-key="id" dense flat />
        
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

<script>
import Papa from "papaparse";
import axios from "axios";

export default {
  data() {
    return {
      file: null,
      parsedData: [],
      loading: false,
      message: "",
      success: false,
      columns: [],
      columnMapping: {
        "description": ["Description", "TransactionTitle", "Opis", "TransaktionBeschreibung"],
        "date": ["Date", "TransactionDate", "Data", "Data waluty"],
        "amount": ["Amount", "Kwota", "Betrag"],
        "currency": ["Currency", "Waluta"]
      }
    };
  },
  methods: {
    onFileSelected(file) {
      if (file) {
        this.parseCSV(file);
      } else {
      // Reset data when file is cleared
        this.parsedData = [];
        this.columns = [];
        this.message = "";
      }
    },
    parseCSV(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        Papa.parse(event.target.result, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const mappedData = results.data.map(row => ({
              date: this.mapColumnValue(row, "date"),
              description: this.extractMerchant(row), // Extracts Merchant Name or Fallback
              amount: this.mapColumnValue(row, "amount"),
              currency: this.mapColumnValue(row, "currency")
            }));
            this.parsedData = mappedData;

            this.columns = Object.keys(this.parsedData[0] || {}).map((col) => ({
              name: col,
              label: col.charAt(0).toUpperCase() + col.slice(1),
              field: col,
              align: "left"
            }));
            console.log("Detected Columns:", Object.keys(results.data[0])); // Prints column names
            console.log("Parsed Data:", results.data); // Prints full parsed CSV
            console.log("Parsed CSV Data:", this.parsedData);
          }
        });
      };
      reader.readAsText(file);
    },

    mapColumnValue(row, field) {
      const possibleNames = this.columnMapping[field];
      for (let name of possibleNames) {
        if (row[name]) {
          return field === "amount" ? parseFloat(row[name]) : row[name];
        }
      }
      return null;
    },

    extractMerchant(row) {
      if (row[""]) {
        let locationText = row[""];
        let match = locationText.match(/Adres:\s+([\w\s]+)/i);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      return row["Opis transakcji"] || "Unknown";
    },

    async uploadTransactions() {
      if (this.parsedData.length === 0) {
        this.message = "No transactions to upload!";
        this.success = false;
        return;
      }

      this.loading = true;
      this.message = "";

      try {
        const response = await axios.post("https://your-backend-api.com/api/transactions/upload", {
          transactions: this.parsedData
        });

        this.message = "Transactions uploaded successfully!";
        this.success = true;
        console.log("Server Response:", response.data);
      } catch (error) {
        console.error("Upload Error:", error);
        this.message = "Error uploading transactions.";
        this.success = false;
      } finally {
        this.loading = false;
      }
    }
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
