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
  import axios from "axios"; // Install: npm install axios
  
  export default {
    data() {
      return {
        file: null,
        parsedData: [],
        loading: false,
        message: "",
        success: false,
        columns: [
          { name: "date", label: "Date", field: "date", align: "left" },
          { name: "description", label: "Description", field: "description", align: "left" },
          { name: "amount", label: "Amount", field: "amount", align: "right" }
        ]
      };
    },
    methods: {
      onFileSelected(file) {
        if (file) {
          this.parseCSV(file);
        }
      },
      parseCSV(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csv = event.target.result;
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              this.parsedData = results.data.map(row => ({
                date: row["Date"],
                description: row["Description"],
                amount: parseFloat(row["Amount"])
              }));
              console.log("Detected Columns:", Object.keys(results.data[0])); // Prints column names
              console.log("Parsed Data:", results.data); // Prints full parsed CSV
            }
          });
        };
        reader.readAsText(file);
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
  