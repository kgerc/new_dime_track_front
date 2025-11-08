// src/stores/expensesStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from 'src/api/axiosInstance'

export const useExpensesStore = defineStore('expenses', () => {
  const entries = ref([])
  const categories = ref([])
  const limits = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Helper to handle API calls with error handling
  async function handleApiCall(apiCall, successCallback, errorMessage) {
    loading.value = true
    error.value = null

    try {
      const response = await apiCall()
      if (successCallback) successCallback(response)
      return response
    } catch (err) {
      error.value = errorMessage || 'An error occurred'
      console.error(errorMessage, err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Expenses
  async function fetchExpenses() {
    return handleApiCall(
      () => api.get('/expenses'),
      (res) => { entries.value = res.data },
      'Error fetching expenses'
    )
  }

  async function addExpense(expense) {
    return handleApiCall(
      () => api.post('/expenses', expense),
      () => { entries.value.push(expense) },
      'Error adding expense'
    )
  }

  async function updateExpense(expense) {
    return handleApiCall(
      () => api.put(`/expenses/${expense.id}`, expense),
      () => {
        const index = entries.value.findIndex(e => e.id === expense.id)
        if (index !== -1) entries.value[index] = { ...expense }
      },
      'Error updating expense'
    )
  }

  async function removeExpense(id) {
    return handleApiCall(
      () => api.delete(`/expenses/${id}`),
      () => { entries.value = entries.value.filter(e => e.id !== id) },
      'Error deleting expense'
    )
  }

  async function moveExpenseToSavings(id) {
    return handleApiCall(
      () => api.delete(`/expenses/moveExpenseToSavings/${id}`),
      () => { entries.value = entries.value.filter(e => e.id !== id) },
      'Error moving expense to savings'
    )
  }

  // Categories
  async function fetchExpenseCategories() {
    return handleApiCall(
      () => api.get('/expenses/categories'),
      (res) => { categories.value = res.data },
      'Error fetching expense categories'
    )
  }

  async function addExpenseCategory(category) {
    return handleApiCall(
      () => api.post('/expenses/category', category),
      () => { categories.value.push(category) },
      'Error adding expense category'
    )
  }

  async function updateExpenseCategory(category) {
    // Clean up tags if empty
    if (category.tags && category.tags.length === 0) {
      category.tags = ""
    }

    return handleApiCall(
      () => api.put(`/expenses/category/${category.id}`, category),
      () => {
        const index = categories.value.findIndex(c => c.id === category.id)
        if (index !== -1) categories.value[index] = { ...category }
      },
      'Error updating expense category'
    )
  }

  async function removeExpenseCategory(id) {
    return handleApiCall(
      () => api.delete(`/expenses/category/${id}`),
      () => { categories.value = categories.value.filter(c => c.id !== id) },
      'Error deleting expense category'
    )
  }

  async function assignExpenseCategories() {
    return handleApiCall(
      () => api.post('/expenses/assignCategories'),
      null,
      'Error assigning expense categories'
    )
  }

  // Limits
  async function fetchExpenseLimits() {
    return handleApiCall(
      () => api.get('/expenses/limits'),
      (res) => { limits.value = res.data },
      'Error fetching expense limits'
    )
  }

  async function addExpenseLimit(limit) {
    return handleApiCall(
      () => api.post('/expenses/limit', limit),
      () => { limits.value.push(limit) },
      'Error adding expense limit'
    )
  }

  async function updateExpenseLimit(limit) {
    // Clean up tags if empty
    if (limit.expenseCategory?.tags?.length === 0) {
      limit.expenseCategory.tags = ""
    }

    return handleApiCall(
      () => api.put(`/expenses/limit/${limit.id}`, limit),
      () => {
        const index = limits.value.findIndex(l => l.id === limit.id)
        if (index !== -1) limits.value[index] = { ...limit }
      },
      'Error updating expense limit'
    )
  }

  async function removeExpenseLimit(id) {
    return handleApiCall(
      () => api.delete(`/expenses/limit/${id}`),
      () => { limits.value = limits.value.filter(l => l.id !== id) },
      'Error deleting expense limit'
    )
  }

  return {
    // State
    entries,
    categories,
    limits,
    loading,
    error,

    // Expenses
    fetchExpenses,
    addExpense,
    updateExpense,
    removeExpense,
    moveExpenseToSavings,

    // Categories
    fetchExpenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    removeExpenseCategory,
    assignExpenseCategories,

    // Limits
    fetchExpenseLimits,
    addExpenseLimit,
    updateExpenseLimit,
    removeExpenseLimit
  }
})
