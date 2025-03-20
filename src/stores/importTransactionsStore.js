import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImportTransactionsStore = defineStore('importTransactions', () => {
  const file = ref(null)
  const parsedData = ref([])

  async function uploadTransactions() {
    try {
    } catch (error) {
      console.error('Error importing transactions:', error)
    }
  }

  return { uploadTransactions, file, parsedData }
})
