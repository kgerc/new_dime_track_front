import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from 'src/api/axiosInstance' // Import the configured Axios instance

export const useExpensesStore = defineStore('expenses', () => {
  const entries = ref([])
  const categories = ref([])
  const limits = ref([])

  async function fetchExpenses() {
    try {
      const response = await api.get('/expenses') // Uses the Axios instance
      entries.value = response.data
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  async function addExpense(expense) {
    try {
      const response = await api.post('/expenses', expense)
      if (response.status === 201 || response.status === 200) { 
        // Only push if response is successful
        entries.value.push(expense)
      } else {
        console.error('Failed to add expense: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  async function removeExpense(id) {
    try {
      const response = await api.delete(`/expenses/${id}`)
      if (response.status === 201 || response.status === 200) { 
        entries.value = entries.value.filter(entry => entry.id !== id)
      } else {
        console.error('Failed to add expense: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  async function updateExpense(updatedExpense) {
    try {
      const response = await api.put(`/expenses/${updatedExpense.id}`, updatedExpense)
      if (response.status === 200) {
        const index = entries.value.findIndex(exp => exp.id === updatedExpense.id)
        if (index !== -1) {
          entries.value[index] = { ...updatedExpense }
        }
      } else {
        console.error('Failed to update expense:', response.status)
      }
    } catch (error) {
      console.error('Error updating expense:', error)
    }
  }

  async function addExpenseCategory(expenseCategory) {
    try {
      const response = await api.post('/expenses/category', expenseCategory)
      if (response.status === 201 || response.status === 200) { 
        // Only push if response is successful
        categories.value.push(expenseCategory)
      } else {
        console.error('Failed to add expense: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  async function fetchExpenseCategories() {
    try {
      const response = await api.get('/expenses/categories') 
      categories.value = response.data
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  async function fetchExpenseLimits() {
    try {
      const response = await api.get('/expenses/limits') 
      limits.value = response.data
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const totalBalance = computed(() => {
    return entries.value.reduce((acc, { amount }) => acc + amount, 0)
  })

  return { entries, fetchExpenses, addExpense, removeExpense, updateExpense,
     totalBalance, addExpenseCategory, fetchExpenseCategories, categories,
     limits, fetchExpenseLimits }
})
