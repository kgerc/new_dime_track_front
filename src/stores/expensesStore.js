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
        console.error('Failed to remove expense: Unexpected response status', response.status)
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
        console.error('Failed to add expense category: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error adding expense category:', error)
    }
  }

  async function fetchExpenseCategories() {
    try {
      const response = await api.get('/expenses/categories') 
      categories.value = response.data
    } catch (error) {
      console.error('Error fetching expense categories:', error)
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

  async function addExpenseLimit(expenseLimit) {
    try {
      const response = await api.post('/expenses/limit', expenseLimit)
      if (response.status === 201 || response.status === 200) { 
        // Only push if response is successful
        limits.value.push(expenseLimit)
      } else {
        console.error('Failed to add expense limit: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error adding expense limit:', error)
    }
  }

  async function updateExpenseLimit(updatedExpenseLimit) {
    try {
      const response = await api.put(`/expenses/limit/${updatedExpenseLimit.id}`, updatedExpenseLimit)
      if (response.status === 200) {
        const index = limits.value.findIndex(exp => exp.id === updatedExpenseLimit.id)
        if (index !== -1) {
          limits.value[index] = { ...updatedExpenseLimit }
        }
      } else {
        console.error('Failed to update expense limit:', response.status)
      }
    } catch (error) {
      console.error('Error updating expense limit:', error)
    }
  }

  async function removeExpenseLimit(id) {
    try {
      const response = await api.delete(`/expenses/limit/${id}`)
      if (response.status === 201 || response.status === 200) { 
        limits.value = limits.value.filter(entry => entry.id !== id)
      } else {
        console.error('Failed to remove expense limit: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  async function updateExpenseCategory(updatedExpenseCategory) {
    try {
      const response = await api.put(`/expenses/category/${updatedExpenseCategory.id}`, updatedExpenseCategory)
      if (response.status === 200) {
        const index = categories.value.findIndex(exp => exp.id === updatedExpenseCategory.id)
        if (index !== -1) {
          categories.value[index] = { ...updatedExpenseCategory }
        }
      } else {
        console.error('Failed to update expense category:', response.status)
      }
    } catch (error) {
      console.error('Error updating expense category:', error)
    }
  }

  async function removeExpenseCategory(id) {
    try {
      const response = await api.delete(`/expenses/category/${id}`)
      if (response.status === 201 || response.status === 200) { 
        categories.value = categories.value.filter(entry => entry.id !== id)
      } else {
        console.error('Failed to remove expense category: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error deleting expense category:', error)
    }
  }


  return { entries, fetchExpenses, addExpense, removeExpense, updateExpense,
     addExpenseCategory, fetchExpenseCategories, categories,
     limits, fetchExpenseLimits, addExpenseLimit, updateExpenseLimit, updateExpenseCategory,
     removeExpenseLimit, removeExpenseCategory }
})
