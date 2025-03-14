import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from 'src/api/axiosInstance' // Import the configured Axios instance

export const useIncomesStore = defineStore('incomes', () => {
  const entries = ref([])
  const categories = ref([])

  async function fetchIncomes() {
    try {
      const response = await api.get('/incomes') // Uses the Axios instance
      entries.value = response.data
    } catch (error) {
      console.error('Error fetching incomes:', error)
    }
  }

  async function addIncome(income) {
    try {
      const response = await api.post('/incomes', income)
      if (response.status === 201 || response.status === 200) { 
        // Only push if response is successful
        entries.value.push(income)
      } else {
        console.error('Failed to add income: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error adding income:', error)
    }
  }

  async function removeIncome(id) {
    try {
      const response = await api.delete(`/incomes/${id}`)
      if (response.status === 201 || response.status === 200) { 
        entries.value = entries.value.filter(entry => entry.id !== id)
      } else {
        console.error('Failed to remove income: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error deleting income:', error)
    }
  }

  async function updateIncome(updatedIncome) {
    try {
      const response = await api.put(`/incomes/${updatedIncome.id}`, updatedIncome)
      if (response.status === 200) {
        const index = entries.value.findIndex(exp => exp.id === updatedIncome.id)
        if (index !== -1) {
          entries.value[index] = { ...updatedIncome }
        }
      } else {
        console.error('Failed to update income:', response.status)
      }
    } catch (error) {
      console.error('Error updating income:', error)
    }
  }

  async function fetchIncomeCategories() {
    try {
      const response = await api.get('/incomes/categories') 
      categories.value = response.data
    } catch (error) {
      console.error('Error fetching income categories:', error)
    }
  }

  return { entries, categories, fetchIncomes, addIncome, removeIncome, updateIncome, fetchIncomeCategories }
})
