import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from 'src/api/axiosInstance' // Import the configured Axios instance

export const useBalancesStore = defineStore('balances', () => {
  const entries = ref([])
  const balanceDict = ref({});

  async function fetchBalances() {
    try {
      const response = await api.get('/balances') // Uses the Axios instance
      entries.value = response.data
    } catch (error) {
      console.error('Error fetching balances:', error)
    }
  }

  async function addBalance(balance) {
    try {
      const response = await api.post('/balances', balance)
      if (response.status === 201 || response.status === 200) { 
        // Only push if response is successful
        entries.value.push(balance)
      } else {
        console.error('Failed to add balance: Unexpected response status', response.status)
      }
    } catch (error) {
      console.error('Error adding balance:', error)
    }
  }

  async function updateBalance(updatedBalance) {
    try {
      const response = await api.put(`/balances/${updatedBalance.id}`, updatedBalance)
      if (response.status === 200) {
        const index = entries.value.findIndex(exp => exp.id === updatedBalance.id)
        if (index !== -1) {
          entries.value[index] = { ...updatedBalance }
        }
      } else {
        console.error('Failed to update balance:', response.status)
      }
    } catch (error) {
      console.error('Error updating balance:', error)
    }
  }

  function createBalanceDictionary() {
    debugger;
    entries.value = [
      {
        year: 2024,
        month: 1,
        amount: 10000
      },
      {
        year: 2025,
        month: 1,
        amount: 10000
      }
    ]
    entries.value.forEach(({ year, month, amount }) => {
        if (!balanceDict.value[year]) {
            balanceDict.value[year] = Array.from({ length: 12 }, () => 0);
        }
        balanceDict.value[year][month - 1] = amount;
    });

    // Fill missing months with the previous month's balance
    Object.keys(balanceDict.value).forEach(year => {
        for (let month = 1; month < 12; month++) {
            if (balanceDict.value[year][month] === 0) {
                balanceDict.value[year][month] = balanceDict[year][month - 1];
            }
        }
    });
  }

  function updateMonthlyBalance(year, month, amount) {
    balanceDict.value[year][month] = amount
  }

  return { 
    entries, balanceDict, createBalanceDictionary, 
    updateMonthlyBalance, fetchBalances, addBalance, updateBalance }
})