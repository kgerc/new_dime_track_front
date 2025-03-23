import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from 'src/api/axiosInstance' // Import the configured Axios instance

export const useImportTransactionsStore = defineStore('importTransactions', () => {
  const file = ref(null)
  const parsedData = ref([])
  const columns = ref([]) 
  const savingsKeywords = ref(["OBLIGACJE SKARBOWE"]); // Default savings indicators

  async function uploadTransactions() {
    try {
      const request = {
        transactions: parsedData.value,
        savingsKeywords: savingsKeywords.value
      };
      const response = await api.post('/imports/transactions', request)
      if (response.status === 201 || response.status === 200) {
        file.value = null;
        parsedData.value = []
      } else {
        console.error('Failed to upload transactions: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error uploading transactions:', error)
    }
  }

  const setSavingsKeywords = (keywords) => {
    savingsKeywords.value = keywords;
  };

  return { uploadTransactions, file, parsedData, columns, savingsKeywords }
})
